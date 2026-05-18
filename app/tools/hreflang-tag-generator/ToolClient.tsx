"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type HreflangRow = {
  language: string;
  url: string;
};

export default function ToolClient() {
  const [rows, setRows] = useState<HreflangRow[]>([
    {
      language: "en",
      url: "",
    },
    {
      language: "en-us",
      url: "",
    },
    {
      language: "en-gb",
      url: "",
    },
  ]);

  const [xDefaultUrl, setXDefaultUrl] = useState("");

  const updateRow = (
    index: number,
    field: keyof HreflangRow,
    value: string
  ) => {
    const updated = [...rows];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        language: "",
        url: "",
      },
    ]);
  };

  const removeRow = (index: number) => {
    setRows(
      rows.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const resetAll = () => {
    setRows([
      {
        language: "en",
        url: "",
      },
      {
        language: "en-us",
        url: "",
      },
      {
        language: "en-gb",
        url: "",
      },
    ]);

    setXDefaultUrl("");
  };

  const generatedTags = [
    ...rows
      .filter((row) => row.language.trim() && row.url.trim())
      .map(
        (row) =>
          `<link rel="alternate" hreflang="${row.language
            .trim()
            .toLowerCase()}" href="${row.url.trim()}" />`
      ),
    ...(xDefaultUrl.trim()
      ? [
          `<link rel="alternate" hreflang="x-default" href="${xDefaultUrl.trim()}" />`,
        ]
      : []),
  ].join("\n");

  return (
    <ToolShell
      title="Hreflang Tag Generator"
      description="Generate hreflang tags for multilingual and international SEO pages with this free online Hreflang Tag Generator."
    >
      {/* INPUTS */}
      <div className="space-y-5">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_2fr_auto]"
          >
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Language Code
              </label>

              <input
                type="text"
                value={row.language}
                onChange={(e) =>
                  updateRow(index, "language", e.target.value)
                }
                placeholder="en-us"
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Page URL
              </label>

              <input
                type="url"
                value={row.url}
                onChange={(e) => updateRow(index, "url", e.target.value)}
                placeholder="https://example.com/us/page"
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => removeRow(index)}
                className="yoryantra-btn-outline w-full"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* X DEFAULT */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          x-default URL
        </label>

        <input
          type="url"
          value={xDefaultUrl}
          onChange={(e) => setXDefaultUrl(e.target.value)}
          placeholder="https://example.com/"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={addRow} className="yoryantra-btn">
          Add Language URL
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(generatedTags)}
          disabled={!generatedTags}
          className="yoryantra-btn-outline"
        >
          Copy Tags
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated hreflang Tags
          </h3>
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {generatedTags || "Generated hreflang tags will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Hreflang tag generation happens locally inside your browser. Your URLs
          and language targeting data are not uploaded, stored, or processed on
          any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Managing hreflang Tags for International SEO Pages
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hreflang tags help search engines understand which language or
            regional version of a page should appear for different users. They
            are useful for multilingual websites, country-specific pages,
            ecommerce stores, and international SEO projects.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            When similar pages exist for different countries or languages,
            hreflang markup helps reduce confusion and points search engines to
            the correct alternate URL.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Hreflang Tag Generator creates clean alternate link tags for
            language-specific pages, regional URLs, and optional x-default
            fallback pages.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Hreflang Tag Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter the language or regional hreflang code.
            </li>

            <li>
              Add the matching page URL for that language or region.
            </li>

            <li>
              Add more language versions if needed.
            </li>

            <li>
              Copy the generated hreflang tags and place them inside the page
              head.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common hreflang Code Examples
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>en:</strong> English language page.
              </li>

              <li>
                <strong>en-us:</strong> English page for users in the United
                States.
              </li>

              <li>
                <strong>en-gb:</strong> English page for users in the United
                Kingdom.
              </li>

              <li>
                <strong>fr:</strong> French language page.
              </li>

              <li>
                <strong>x-default:</strong> Default fallback page when no
                specific language or region match is available.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Creating hreflang tags for multilingual websites.
            </li>

            <li>
              Managing country-specific landing pages.
            </li>

            <li>
              Improving international SEO targeting.
            </li>

            <li>
              Reducing duplicate content confusion across regional pages.
            </li>

            <li>
              Adding x-default fallback URLs for global websites.
            </li>

            <li>
              Preparing SEO tags for ecommerce category and product pages.
            </li>

            <li>
              Handling similar English pages for US, UK, India, Australia, or
              Canada.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example hreflang Tags
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<link rel="alternate" hreflang="en-us" href="https://example.com/us/page" />
<link rel="alternate" hreflang="en-gb" href="https://example.com/uk/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why hreflang Matters in International SEO
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better international targeting:</strong> Help search
                engines show the correct page version by language or region.
              </li>

              <li>
                <strong>Cleaner SEO signals:</strong> Reduce confusion between
                similar pages made for different countries.
              </li>

              <li>
                <strong>Improved user experience:</strong> Send visitors to a
                page version that matches their language or location.
              </li>

              <li>
                <strong>Stronger site structure:</strong> Keep multilingual and
                regional pages connected correctly.
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
                What is a hreflang tag?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A hreflang tag is an HTML link tag that tells search engines
                which language or regional version of a page should be shown to
                users.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where should hreflang tags be added?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Hreflang tags are usually added inside the head section of each
                relevant page.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is x-default in hreflang?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                x-default is a fallback URL used when no specific language or
                regional page is the best match.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is hreflang useful for international SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Hreflang is useful for multilingual websites, regional
                landing pages, international ecommerce stores, and global SEO
                projects.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is hreflang tag generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Hreflang tags are generated entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Hreflang generation often connects with technical SEO, sitemap
            management, canonical URLs, metadata optimization, and campaign
            tracking workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
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
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
            </Link>

            <Link
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>

            <Link
              href="/tools/utm-builder"
              className="yoryantra-btn-outline"
            >
              UTM Builder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}