"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const generateSlug = () => {
    const slug = input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setOutput(slug);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="Slug Generator"
      description="Generate clean SEO-friendly URL slugs instantly with this free online Slug Generator."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full h-56 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Enter title or text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateSlug}
          className="yoryantra-btn"
        >
          Generate Slug
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
            Generated Slug
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[140px] whitespace-pre-wrap break-words">
          {output ||
            "Generated SEO-friendly slug will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Turning Titles Into Clean SEO Slugs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            URL slugs help create clean, readable, and search-engine-friendly
            website links. Slugs are commonly used in blog posts, product
            pages, documentation, landing pages, ecommerce stores, and content
            management systems to generate meaningful URLs from titles or text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During SEO optimization, messy URLs with random characters, long
            query strings, uppercase text, or unsupported symbols can reduce
            readability and make links harder to share. This Slug Generator
            helps convert titles into clean lowercase URL slugs automatically.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool removes unsupported characters, replaces spaces with
            hyphens, simplifies URLs, and creates web-safe slugs directly inside
            your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Slug Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a title or text into the input field.</li>

            <li>
              Click <strong>Generate Slug</strong>.
            </li>

            <li>
              Review the generated SEO-friendly slug.
            </li>

            <li>
              Copy the slug and use it in your website URL.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating SEO-friendly blog post URLs.</li>

            <li>Generating clean product page links.</li>

            <li>Converting article titles into web-safe slugs.</li>

            <li>Preparing URLs for CMS platforms.</li>

            <li>Improving readability of website URLs.</li>

            <li>Creating slugs for Next.js and React routes.</li>

            <li>Removing unsupported URL characters automatically.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example SEO Slug
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Original title:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
10 Best SEO Tips for Beginners
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Generated slug:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
10-best-seo-tips-for-beginners
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why SEO-Friendly Slugs Matter
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better readability:</strong> Clean slugs are easier for
                users to understand and share.
              </li>

              <li>
                <strong>Improved SEO signals:</strong> Search engines can better
                understand page topics from readable URLs.
              </li>

              <li>
                <strong>Cleaner website structure:</strong> Consistent URL
                formatting improves navigation and organization.
              </li>

              <li>
                <strong>Improved link sharing:</strong> Short, readable URLs
                look better across platforms and social media.
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
                What is a URL slug?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A URL slug is the readable part of a webpage URL that identifies
                a specific page, article, or resource.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are SEO-friendly slugs important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Clean slugs improve readability, help search engines understand
                page topics, and create more user-friendly URLs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this Slug Generator remove special characters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool removes unsupported symbols, converts text to
                lowercase, and replaces spaces with hyphens automatically.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use generated slugs in Next.js routes?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Generated slugs work well for Next.js, React, CMS
                platforms, blogs, ecommerce stores, and most modern websites.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is slug generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Slug generation happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/slug-generator" />
        </div>
      </section>
    </ToolShell>
  );
}