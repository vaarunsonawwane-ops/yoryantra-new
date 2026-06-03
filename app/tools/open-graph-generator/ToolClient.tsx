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
  const [siteName, setSiteName] = useState("");
  const [output, setOutput] = useState("");

  const generateOGTags = () => {
    const tags = `<!-- Open Graph Meta Tags -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:site_name" content="${siteName}" />`;

    setOutput(tags);
  };

  const resetAll = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setImage("");
    setSiteName("");
    setOutput("");
  };

  return (
    <ToolShell
      title="Open Graph Generator"
      description="Generate Open Graph meta tags instantly with this free online Open Graph Generator."
    >
      {/* TITLE */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Page Title
        </label>

        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Enter page title..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* DESCRIPTION */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="Enter page description..."
          className="w-full h-32 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* URL */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Page URL
        </label>

        <input
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
          Preview Image URL
        </label>

        <input
          value={image}
          onChange={(e) =>
            setImage(e.target.value)
          }
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* SITE NAME */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Site Name
        </label>

        <input
          value={siteName}
          onChange={(e) =>
            setSiteName(e.target.value)
          }
          placeholder="Website name..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generateOGTags}
          className="yoryantra-btn"
        >
          Generate Open Graph Tags
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
            Generated Open Graph Tags
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[240px] whitespace-pre-wrap break-words">
          {output ||
            "Generated Open Graph tags will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Making Open Graph Tags Look Right When Links Are Shared
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Open Graph tags help websites control how links appear when shared
            on social media platforms, messaging apps, collaboration tools, and
            community websites. Platforms such as Facebook, LinkedIn, Discord,
            Slack, and WhatsApp use Open Graph metadata to generate preview
            cards automatically.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During SEO and social sharing optimization, missing or incorrect
            Open Graph tags can create broken previews, missing images, weak
            branding, poor click-through rates, and inconsistent link previews.
            This Open Graph Generator helps create clean OG tags quickly without
            manually writing metadata.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for blogs, landing pages, product pages,
            portfolios, frontend applications, ecommerce stores, and marketing
            workflows directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Open Graph Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the page title and description.</li>

            <li>
              Add the page URL and preview image URL.
            </li>

            <li>
              Enter your website or brand name.
            </li>

            <li>
              Click <strong>Generate Open Graph Tags</strong>.
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
            <li>Improving social media link previews.</li>

            <li>Generating Open Graph metadata for websites.</li>

            <li>Creating Facebook and LinkedIn preview cards.</li>

            <li>Improving social sharing click-through rates.</li>

            <li>Adding preview image support to webpages.</li>

            <li>Optimizing blog posts and landing pages.</li>

            <li>Preparing metadata for Next.js and React websites.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Open Graph Tags
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<meta property="og:title" content="Yoryantra Tools" />

<meta
  property="og:description"
  content="Free online developer and SEO tools."
/>

<meta
  property="og:url"
  content="https://yoryantra.com"
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
            Why Open Graph Tags Matter
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better previews:</strong> Open Graph tags improve how
                links appear on social platforms.
              </li>

              <li>
                <strong>Higher engagement:</strong> Better previews can improve
                click-through rates and sharing performance.
              </li>

              <li>
                <strong>Consistent branding:</strong> Preview titles, images,
                and descriptions stay controlled across platforms.
              </li>

              <li>
                <strong>Improved sharing experience:</strong> Users see richer
                previews instead of incomplete metadata.
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
                What are Open Graph tags?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Open Graph tags are metadata used by social media platforms and
                messaging apps to generate webpage preview cards.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which platforms use Open Graph metadata?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Facebook, LinkedIn, Discord, Slack, WhatsApp, and many other
                platforms use Open Graph tags.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do Open Graph tags affect SEO rankings?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Open Graph tags do not directly affect rankings, but they can
                improve social visibility, engagement, and click-through rates.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use Open Graph tags in Next.js?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The generated tags can be adapted for Next.js, React, HTML
                websites, and most modern web frameworks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Open Graph generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Open Graph tag generation happens directly inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Open Graph optimization often connects with meta tags, canonical
            URLs, sitemaps, redirects, and technical SEO workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
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