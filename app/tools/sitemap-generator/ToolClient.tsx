"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [urls, setUrls] = useState("");
  const [output, setOutput] = useState("");

  const generateSitemap = () => {
    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlList
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join("\n")}
</urlset>`;

    setOutput(sitemap);
  };

  const resetAll = () => {
    setUrls("");
    setOutput("");
  };

  return (
    <ToolShell
      title="Sitemap Generator"
      description="Generate XML sitemaps instantly with this free online Sitemap Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Website URLs
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder={`https://example.com
https://example.com/about
https://example.com/contact`}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateSitemap}
          className="yoryantra-btn"
        >
          Generate Sitemap
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
            Generated Sitemap XML
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Generated sitemap.xml will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building XML Sitemaps Search Engines Can Read
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            XML sitemaps help search engines discover, crawl, and index website
            pages more efficiently. Search engines such as Google and Bing use
            sitemap files to understand website structure, detect important
            pages, and prioritize crawling during indexing.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During technical SEO audits, missing or outdated sitemap.xml files
            can reduce crawl efficiency, delay indexing, hide important pages,
            and make large websites harder for search engines to understand.
            This Sitemap Generator helps create clean XML sitemap files quickly
            from a list of URLs.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for blogs, ecommerce stores, landing pages,
            static websites, business websites, frontend applications, and SEO
            workflows directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Sitemap Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter one website URL per line.</li>

            <li>
              Click <strong>Generate Sitemap</strong>.
            </li>

            <li>
              Copy the generated XML sitemap output.
            </li>

            <li>
              Save the file as <strong>sitemap.xml</strong>.
            </li>

            <li>
              Upload the sitemap.xml file to your website root directory.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating XML sitemap files for websites.</li>

            <li>Submitting sitemaps to Google Search Console.</li>

            <li>Improving search engine crawl efficiency.</li>

            <li>Managing SEO for blogs and ecommerce stores.</li>

            <li>Creating sitemaps for static websites.</li>

            <li>Preparing technical SEO audits and migrations.</li>

            <li>Helping search engines discover new pages faster.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Sitemap.xml File
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://example.com</loc>
  </url>

  <url>
    <loc>https://example.com/about</loc>
  </url>

  <url>
    <loc>https://example.com/contact</loc>
  </url>

</urlset>`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why XML Sitemaps Help SEO
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Faster discovery:</strong> Search engines can find new
                pages more quickly.
              </li>

              <li>
                <strong>Better crawl coverage:</strong> Important pages are less
                likely to be missed.
              </li>

              <li>
                <strong>Improved indexing:</strong> Sitemap files help search
                engines understand site structure.
              </li>

              <li>
                <strong>Large website support:</strong> Sitemaps are especially
                useful for websites with many URLs.
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
                What is a sitemap.xml file?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A sitemap.xml file lists important website URLs to help search
                engines crawl and index pages more efficiently.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where should I upload sitemap.xml?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The sitemap.xml file is usually uploaded to the root of your
                domain, such as example.com/sitemap.xml.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I submit my sitemap to Google?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Submitting your sitemap through Google Search Console can
                help Google discover and index pages faster.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do small websites need XML sitemaps?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Even smaller websites benefit from XML sitemaps because they
                help search engines understand site structure and page priority.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is sitemap generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Sitemap generation happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Sitemap generation often connects with robots.txt configuration,
            canonical URLs, redirects, crawl optimization, and technical SEO
            workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/robots-txt-generator"
              className="yoryantra-btn-outline"
            >
              Robots.txt Generator
            </Link>

            <Link
              href="/tools/robots-txt-tester"
              className="yoryantra-btn-outline"
            >
              Robots.txt Tester
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