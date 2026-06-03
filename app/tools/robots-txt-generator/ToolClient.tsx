"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [userAgent, setUserAgent] = useState("*");
  const [allowPath, setAllowPath] = useState("/");
  const [disallowPath, setDisallowPath] = useState("/admin");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [output, setOutput] = useState("");

  const generateRobotsTxt = () => {
    let robots = `User-agent: ${userAgent}\n`;

    if (allowPath.trim()) {
      robots += `Allow: ${allowPath}\n`;
    }

    if (disallowPath.trim()) {
      robots += `Disallow: ${disallowPath}\n`;
    }

    if (sitemapUrl.trim()) {
      robots += `\nSitemap: ${sitemapUrl}`;
    }

    setOutput(robots.trim());
  };

  const resetAll = () => {
    setUserAgent("*");
    setAllowPath("/");
    setDisallowPath("/admin");
    setSitemapUrl("");
    setOutput("");
  };

  return (
    <ToolShell
      title="Robots.txt Generator"
      description="Generate robots.txt files instantly with this free online Robots.txt Generator."
    >
      {/* USER AGENT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          User Agent
        </label>

        <input
          value={userAgent}
          onChange={(e) => setUserAgent(e.target.value)}
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ALLOW */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Allow Path
        </label>

        <input
          value={allowPath}
          onChange={(e) => setAllowPath(e.target.value)}
          placeholder="/"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* DISALLOW */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Disallow Path
        </label>

        <input
          value={disallowPath}
          onChange={(e) => setDisallowPath(e.target.value)}
          placeholder="/admin"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* SITEMAP */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Sitemap URL
        </label>

        <input
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
          placeholder="https://example.com/sitemap.xml"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateRobotsTxt}
          className="yoryantra-btn"
        >
          Generate Robots.txt
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Robots.txt
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output ||
            "Generated robots.txt output will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Creating Robots.txt Files Without Blocking the Wrong Pages
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Robots.txt files help websites control how search engines and bots
            crawl pages, directories, media files, APIs, and dynamic URLs.
            Search engines check robots.txt instructions before crawling a
            website to determine which sections should be allowed or blocked.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During technical SEO setup, incorrect robots.txt rules can
            accidentally block important pages, reduce indexing, hide assets,
            break crawl paths, or prevent search engines from discovering
            valuable content. This Robots.txt Generator helps create clean crawl
            rules quickly without writing everything manually.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for blogs, ecommerce stores, SaaS dashboards,
            frontend applications, staging environments, static websites, and
            technical SEO workflows directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Robots.txt Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter the user agent, usually <strong>*</strong> for all bots.
            </li>

            <li>
              Add allowed and blocked paths.
            </li>

            <li>
              Add your sitemap URL if available.
            </li>

            <li>
              Click <strong>Generate Robots.txt</strong>.
            </li>

            <li>
              Copy the generated robots.txt file and upload it to your website
              root.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating robots.txt files for new websites.</li>

            <li>Blocking admin panels and private sections.</li>

            <li>Managing crawler access for SEO optimization.</li>

            <li>Adding sitemap.xml locations for search engines.</li>

            <li>Preparing crawl rules before deployment.</li>

            <li>Configuring crawl access for ecommerce stores.</li>

            <li>Improving technical SEO and crawl efficiency.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Robots.txt File
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://example.com/sitemap.xml`}
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
                <strong>User-agent:</strong> Specifies which crawler the rules
                apply to.
              </li>

              <li>
                <strong>Allow:</strong> Permits crawlers to access specific
                paths or sections.
              </li>

              <li>
                <strong>Disallow:</strong> Blocks crawlers from specific URLs or
                directories.
              </li>

              <li>
                <strong>Sitemap:</strong> Helps search engines locate XML
                sitemap files faster.
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
                Robots.txt is a text file placed at the root of a website to
                provide crawl instructions for search engines and bots.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where should I upload robots.txt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The robots.txt file is usually uploaded to the root of the
                domain, such as example.com/robots.txt.
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
                Does robots.txt protect private content?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Robots.txt is only a crawler instruction and should not be
                used to secure sensitive or private information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is robots.txt generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Robots.txt generation happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Robots.txt generation often connects with sitemap creation,
            canonical URLs, redirects, crawl optimization, and technical SEO
            workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/robots-txt-tester"
              className="yoryantra-btn-outline"
            >
              Robots.txt Tester
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