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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This Meta Tag Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Meta Tag Generator helps you create SEO-friendly meta tags
            for websites instantly. Meta tags improve how webpages appear
            in search engines and social media previews.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The generated output includes standard HTML meta tags,
            Open Graph tags for Facebook and LinkedIn, and Twitter card
            meta tags for better social sharing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What Meta Tags Are Included?
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>HTML title tag</li>
            <li>Meta description tag</li>
            <li>Open Graph tags</li>
            <li>Twitter card tags</li>
            <li>Social preview image tags</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Improving website SEO.</li>
            <li>Creating social sharing previews.</li>
            <li>Optimizing website click-through rates.</li>
            <li>Generating metadata for landing pages.</li>
            <li>Adding Open Graph support to websites.</li>
          </ul>
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
                Meta tags provide information about a webpage to search
                engines and social media platforms.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are Open Graph tags important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Open Graph tags control how your webpage appears when
                shared on platforms like Facebook and LinkedIn.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use these tags in Next.js?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The generated meta tags can be adapted for Next.js,
                React, HTML websites, and most web frameworks.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/slug-generator" className="yoryantra-btn-outline">
              Slug Generator
            </Link>

            <Link href="/tools/word-counter" className="yoryantra-btn-outline">
              Word Counter
            </Link>

            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/qr-code-generator" className="yoryantra-btn-outline">
              QR Code Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}