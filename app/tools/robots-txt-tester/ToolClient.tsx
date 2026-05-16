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
      description="Test robots.txt rules against URLs and user agents instantly with this free online Robots.txt Tester."
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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Testing Robots.txt Rules Before Search Engines Crawl
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Robots.txt files help websites control how search engines and
            crawlers access pages, directories, media files, and dynamic URLs.
            Search engines such as Googlebot read robots.txt rules before
            crawling a website to determine which areas should be allowed or
            blocked.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During technical SEO audits, incorrect robots.txt rules can block
            important pages, hide assets from search engines, reduce indexing,
            break crawl paths, or accidentally expose restricted sections. This
            tester helps verify whether a URL path is allowed or blocked for a
            selected user agent.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for SEO debugging, crawl optimization, migration
            reviews, ecommerce stores, staging environments, frontend
            applications, and technical SEO workflows directly inside your
            browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Robots.txt Tester
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your robots.txt file content.</li>

            <li>
              Enter the URL path you want to test.
            </li>

            <li>
              Specify a user agent such as Googlebot if needed.
            </li>

            <li>
              Click <strong>Test Robots.txt</strong>.
            </li>

            <li>
              Review whether the path is allowed or blocked.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking blocked pages during SEO audits.</li>

            <li>Testing Googlebot crawl permissions.</li>

            <li>Reviewing ecommerce category crawl rules.</li>

            <li>Debugging accidental indexing problems.</li>

            <li>Validating robots.txt rules before deployment.</li>

            <li>Inspecting staging and development site restrictions.</li>

            <li>Auditing crawl behavior during website migrations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Robots.txt Rules
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`User-agent: *
Disallow: /admin
Allow: /blog`}
            </pre>

            <p className="mt-4">Test URL:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
/admin/settings
            </pre>

            <p className="mt-4">Result:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Blocked by robots.txt rules.
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Robots.txt Directives
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>User-agent:</strong> Defines which crawler the rules
                apply to.
              </li>

              <li>
                <strong>Disallow:</strong> Blocks crawlers from accessing
                specific paths or directories.
              </li>

              <li>
                <strong>Allow:</strong> Explicitly permits crawlers to access
                certain paths.
              </li>

              <li>
                <strong>Sitemap:</strong> Helps search engines discover sitemap
                files faster.
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
                What is robots.txt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Robots.txt is a configuration file used to control crawler and
                search engine access to specific website sections.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is robots.txt important for SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Robots.txt helps guide search engine crawlers, protect sensitive
                sections, optimize crawl budgets, and prevent accidental
                indexing problems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does Disallow mean in robots.txt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The Disallow directive tells crawlers not to access specific
                URLs, directories, or website sections.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can robots.txt block pages from Google?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Incorrect robots.txt rules can prevent search engines from
                crawling important pages and assets.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is robots.txt testing processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Robots.txt testing happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Robots.txt testing often connects with sitemaps, canonical URLs,
            redirects, meta tags, crawl optimization, and technical SEO
            auditing workflows.
          </p>

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
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
            </Link>

            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
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