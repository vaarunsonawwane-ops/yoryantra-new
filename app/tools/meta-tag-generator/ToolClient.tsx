"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [output, setOutput] = useState("");

  const generateMetaTags = () => {
    const tags = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${description}" />
<meta property="twitter:image" content="${image}" />`;

    setOutput(tags);
  };

  const resetAll = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setImage("");
    setOutput("");
  };

  return (
    <ToolShell
      title="Meta Tag Generator"
      description="Generate SEO meta tags instantly with this free online Meta Tag Generator."
    >
      {/* TITLE */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Website Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Enter website title..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* DESCRIPTION */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Meta Description
        </label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="Enter meta description..."
          className="w-full h-32 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* URL */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Website URL
        </label>

        <input
          type="text"
          value={url}
          onChange={(e) =>
            setUrl(e.target.value)
          }
          placeholder="https://example.com"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* IMAGE */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Social Preview Image URL
        </label>

        <input
          type="text"
          value={image}
          onChange={(e) =>
            setImage(e.target.value)
          }
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateMetaTags}
          className="yoryantra-btn"
        >
          Generate Meta Tags
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
            Generated Meta Tags
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
          {output || "Generated meta tags will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Writing Meta Tags Search Engines Can Understand
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Meta tags help search engines, browsers, and social media platforms
            understand what a webpage is about. They influence how pages appear
            in search results, social previews, browser tabs, and link sharing
            cards across platforms such as Google, Facebook, LinkedIn, and X.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During SEO optimization, missing or poorly written meta tags can
            reduce click-through rates, create weak social previews, confuse
            search engines, and lower visibility in search results. This Meta
            Tag Generator helps create clean HTML meta tags, Open Graph tags,
            and Twitter card tags quickly without writing them manually.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for blogs, landing pages, ecommerce stores,
            frontend applications, portfolios, SaaS websites, and technical SEO
            workflows directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Meta Tag Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter your website or page title.</li>

            <li>
              Add a meta description for search engines.
            </li>

            <li>
              Enter the page URL and social preview image URL.
            </li>

            <li>
              Click <strong>Generate Meta Tags</strong>.
            </li>

            <li>
              Copy the generated tags into your website HTML or framework.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating SEO-friendly HTML meta tags.</li>

            <li>Creating Open Graph tags for social sharing.</li>

            <li>Improving search engine click-through rates.</li>

            <li>Adding Twitter card preview support.</li>

            <li>Optimizing landing pages and blog posts.</li>

            <li>Preparing metadata for Next.js and React websites.</li>

            <li>Improving technical SEO structure.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Meta Tags
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<title>Yoryantra SEO Tools</title>

<meta
  name="description"
  content="Free online SEO and developer tools."
/>

<meta
  property="og:title"
  content="Yoryantra SEO Tools"
/>

<meta
  property="og:image"
  content="https://example.com/preview.jpg"
/>`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Meta Tags Matter for SEO
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better visibility:</strong> Meta tags help search
                engines understand page content more clearly.
              </li>

              <li>
                <strong>Improved click-through rates:</strong> Well-written
                titles and descriptions attract more clicks.
              </li>

              <li>
                <strong>Better social previews:</strong> Open Graph tags improve
                how links appear on social media.
              </li>

              <li>
                <strong>Stronger branding:</strong> Consistent metadata improves
                presentation across platforms.
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
                What are meta tags?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Meta tags provide information about a webpage to search engines,
                browsers, and social media platforms.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are meta descriptions important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Meta descriptions help search engines display page summaries in
                search results and can improve click-through rates.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What are Open Graph tags?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Open Graph tags control how webpages appear when shared on
                platforms such as Facebook and LinkedIn.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use these meta tags in Next.js?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The generated meta tags can be adapted for Next.js, React,
                HTML websites, and most modern frameworks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is meta tag generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Meta tag generation happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Meta tag optimization often connects with Open Graph previews,
            canonical URLs, redirects, sitemap generation, and technical SEO
            workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>

            <Link
              href="/tools/canonical-url-checker"
              className="yoryantra-btn-outline"
            >
              Canonical URL Checker
            </Link>

            <Link
              href="/tools/sitemap-generator"
              className="yoryantra-btn-outline"
            >
              Sitemap Generator
            </Link>

            <Link
              href="/tools/robots-txt-generator"
              className="yoryantra-btn-outline"
            >
              Robots.txt Generator
            </Link>

            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}