"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

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
          {output || "Generated SEO-friendly slug will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Slug Generator?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Slug Generator helps you convert titles and text into
            clean, readable, and SEO-friendly URL slugs. Slugs are commonly
            used in blog URLs, article links, product pages, and content
            management systems to create better-looking web addresses.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A good URL slug improves readability and can help search engines
            understand page content more clearly. This tool removes special
            characters, converts text to lowercase, and replaces spaces with
            hyphens automatically.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Slug Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a title or text into the input field.</li>
            <li>Click <strong>Generate Slug</strong>.</li>
            <li>View the generated SEO-friendly slug below.</li>
            <li>Copy the slug and use it in your website URLs.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Creating SEO-friendly blog post URLs.</li>
            <li>Generating clean product page links.</li>
            <li>Improving readability of website URLs.</li>
            <li>Converting article titles into web-safe slugs.</li>
            <li>Preparing URLs for CMS and web applications.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
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
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a slug?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A slug is the readable part of a URL that identifies a specific
                page or article. It usually appears after the domain name.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are SEO-friendly slugs important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Clean slugs improve readability for users and help search
                engines better understand page content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this Slug Generator remove special characters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool removes unsupported symbols and converts spaces
                into hyphens for cleaner URLs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Slug Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Everything runs directly in your browser. Your text is not
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
            <Link href="/tools/text-case-converter" className="yoryantra-btn-outline">
              Text Case Converter
            </Link>

            <Link href="/tools/word-counter" className="yoryantra-btn-outline">
              Word Counter
            </Link>

            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
