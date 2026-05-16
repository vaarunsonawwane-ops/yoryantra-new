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
          {output || "Generated Open Graph tags will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Open Graph Generator?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Open Graph Generator helps you create Open Graph meta tags
            for websites instantly. Open Graph tags control how webpages
            appear when shared on social media platforms like Facebook,
            LinkedIn, Discord, and messaging apps.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Proper Open Graph tags improve social previews, click-through
            rates, and overall sharing experience across platforms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What Open Graph Tags Are Included?
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>og:title</li>
            <li>og:description</li>
            <li>og:url</li>
            <li>og:image</li>
            <li>og:site_name</li>
            <li>og:type</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Improving social media sharing previews.</li>
            <li>Creating better Facebook and LinkedIn cards.</li>
            <li>Optimizing website click-through rates.</li>
            <li>Generating Open Graph metadata quickly.</li>
            <li>Adding social preview support to websites.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
{`<meta property="og:title" content="Yoryantra Tools" />
<meta property="og:description" content="Free developer utilities" />
<meta property="og:url" content="https://yoryantra.com" />
<meta property="og:image" content="https://example.com/image.jpg" />`}
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
                What are Open Graph tags?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Open Graph tags are metadata used by social platforms to
                display webpage previews when links are shared.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which platforms use Open Graph tags?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Facebook, LinkedIn, Discord, WhatsApp, Slack, and many
                other platforms use Open Graph metadata.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Open Graph important for SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Open Graph tags do not directly improve rankings, but they
                can improve social sharing visibility and click-through rates.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Open Graph Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Everything runs directly in your browser and no data is
                uploaded to any server.
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

            <Link href="/tools/sitemap-generator" className="yoryantra-btn-outline">
              Sitemap Generator
            </Link>

            <Link href="/tools/robots-txt-generator" className="yoryantra-btn-outline">
              Robots.txt Generator
            </Link>

            <Link href="/tools/slug-generator" className="yoryantra-btn-outline">
              Slug Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
