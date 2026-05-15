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

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateRobotsTxt} className="yoryantra-btn">
          Generate Robots.txt
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Robots.txt
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "Generated robots.txt output will appear here..."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This Robots.txt Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Robots.txt Generator helps you create a robots.txt file for
            your website. A robots.txt file tells search engine crawlers which
            parts of your site they can or should not crawl.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            It is commonly used to block admin pages, private paths, duplicate
            sections, or low-value URLs while still allowing search engines to
            access important public pages.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Robots.txt Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the user agent, usually <strong>*</strong> for all bots.</li>
            <li>Add allowed and blocked paths.</li>
            <li>Add your sitemap URL if available.</li>
            <li>Copy the generated robots.txt file and upload it to your website root.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating a robots.txt file for a new website.</li>
            <li>Blocking admin or private website sections.</li>
            <li>Adding sitemap location for search engines.</li>
            <li>Managing crawler access for SEO.</li>
            <li>Preparing crawl rules for blogs, tools, and business websites.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
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
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is robots.txt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Robots.txt is a text file placed at the root of a website to
                give crawling instructions to search engines and bots.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where should I upload robots.txt?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It should be placed at the root of your domain, for example
                example.com/robots.txt.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does robots.txt guarantee privacy?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Robots.txt is only a crawling instruction. It should not be
                used to protect sensitive or private data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Robots.txt Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Everything runs directly in your browser and no data is
                uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/meta-tag-generator" className="yoryantra-btn-outline">
              Meta Tag Generator
            </Link>

            <Link href="/tools/slug-generator" className="yoryantra-btn-outline">
              Slug Generator
            </Link>

            <Link href="/tools/word-counter" className="yoryantra-btn-outline">
              Word Counter
            </Link>

            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}