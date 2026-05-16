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
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Sitemap Generator?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Sitemap Generator helps you create XML sitemap files for
            websites instantly. XML sitemaps help search engines discover,
            crawl, and index important pages more efficiently.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A sitemap.xml file is commonly submitted to Google Search Console
            and other search engines to improve website indexing and SEO
            visibility.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Sitemap Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter one website URL per line.</li>
            <li>Click <strong>Generate Sitemap</strong>.</li>
            <li>Copy the generated XML sitemap.</li>
            <li>Save it as sitemap.xml and upload it to your website root.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating sitemap.xml files for websites.</li>
            <li>Submitting sitemaps to search engines.</li>
            <li>Improving crawl efficiency and indexing.</li>
            <li>Managing SEO for blogs and business websites.</li>
            <li>Generating sitemaps for static websites.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com</loc>
  </url>

  <url>
    <loc>https://example.com/about</loc>
  </url>
</urlset>`}
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
                What is a sitemap.xml file?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A sitemap.xml file lists important URLs on a website to help
                search engines crawl and index pages efficiently.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where should I upload sitemap.xml?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The sitemap.xml file should be uploaded to the root of your
                domain, such as example.com/sitemap.xml.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should I submit my sitemap to Google?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Submitting your sitemap to Google Search Console can help
                Google discover and index pages faster.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Sitemap Generator secure?
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
            <Link href="/tools/robots-txt-generator" className="yoryantra-btn-outline">
              Robots.txt Generator
            </Link>

            <Link href="/tools/meta-tag-generator" className="yoryantra-btn-outline">
              Meta Tag Generator
            </Link>

            <Link href="/tools/slug-generator" className="yoryantra-btn-outline">
              Slug Generator
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
