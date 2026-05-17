"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [url, setUrl] =
    useState("");

  const [source, setSource] =
    useState("");

  const [medium, setMedium] =
    useState("");

  const [campaign, setCampaign] =
    useState("");

  const [term, setTerm] =
    useState("");

  const [content, setContent] =
    useState("");

  const generatedUrl =
    useMemo(() => {
      try {
        if (!url.trim())
          return "";

        const parsed =
          new URL(url);

        if (source) {
          parsed.searchParams.set(
            "utm_source",
            source
          );
        }

        if (medium) {
          parsed.searchParams.set(
            "utm_medium",
            medium
          );
        }

        if (campaign) {
          parsed.searchParams.set(
            "utm_campaign",
            campaign
          );
        }

        if (term) {
          parsed.searchParams.set(
            "utm_term",
            term
          );
        }

        if (content) {
          parsed.searchParams.set(
            "utm_content",
            content
          );
        }

        return parsed.toString();
      } catch {
        return "";
      }
    }, [
      url,
      source,
      medium,
      campaign,
      term,
      content,
    ]);

  const resetAll = () => {
    setUrl("");
    setSource("");
    setMedium("");
    setCampaign("");
    setTerm("");
    setContent("");
  };

  return (
    <ToolShell
      title="UTM Builder"
      description="Generate campaign tracking URLs instantly with this free online UTM Builder."
    >
      {/* URL */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Website URL
        </label>

        <input
          type="url"
          value={url}
          onChange={(e) =>
            setUrl(
              e.target.value
            )
          }
          placeholder="https://example.com"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* GRID */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            UTM Source
          </label>

          <input
            type="text"
            value={source}
            onChange={(e) =>
              setSource(
                e.target.value
              )
            }
            placeholder="google"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            UTM Medium
          </label>

          <input
            type="text"
            value={medium}
            onChange={(e) =>
              setMedium(
                e.target.value
              )
            }
            placeholder="cpc"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            UTM Campaign
          </label>

          <input
            type="text"
            value={campaign}
            onChange={(e) =>
              setCampaign(
                e.target.value
              )
            }
            placeholder="summer_sale"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            UTM Term
          </label>

          <input
            type="text"
            value={term}
            onChange={(e) =>
              setTerm(
                e.target.value
              )
            }
            placeholder="running_shoes"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          UTM Content
        </label>

        <input
          type="text"
          value={content}
          onChange={(e) =>
            setContent(
              e.target.value
            )
          }
          placeholder="banner_ad"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() =>
            navigator.clipboard.writeText(
              generatedUrl
            )
          }
          disabled={!generatedUrl}
          className="yoryantra-btn"
        >
          Copy UTM URL
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
            Generated UTM URL
          </h3>
        </div>

        <div className="yoryantra-output min-h-[180px] text-sm break-words whitespace-pre-wrap overflow-auto">
          {generatedUrl ||
            "Generated UTM tracking URL will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          UTM URL generation happens locally inside your browser. Your campaign
          URLs, tracking parameters, and marketing data are not uploaded,
          stored, or processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building UTM Links for Campaign Tracking
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            UTM Builder helps marketers, SEO professionals, developers, and
            growth teams create campaign tracking URLs for Google Analytics,
            paid ads, email campaigns, affiliate marketing, newsletters, social
            media campaigns, influencer traffic, and performance reporting.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            UTM parameters are tracking tags added to URLs so analytics
            platforms can identify traffic sources, campaign performance,
            keywords, ad variations, and conversion behavior across marketing
            channels.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This UTM Builder generates campaign tracking links directly inside
            your browser without requiring analytics plugins or external
            marketing tools.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the UTM Builder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter the destination website URL.
            </li>

            <li>
              Add UTM tracking parameters such as source, medium, and campaign.
            </li>

            <li>
              Copy the generated UTM tracking URL instantly.
            </li>

            <li>
              Use the URL in ads, campaigns, newsletters, or social media
              posts.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common UTM Parameters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>utm_source:</strong>{" "}
                Identifies the traffic source such as Google, Facebook, or
                newsletter.
              </li>

              <li>
                <strong>utm_medium:</strong>{" "}
                Identifies the marketing channel such as cpc, email, or social.
              </li>

              <li>
                <strong>utm_campaign:</strong>{" "}
                Identifies the campaign name or promotion.
              </li>

              <li>
                <strong>utm_term:</strong>{" "}
                Tracks keywords or paid search terms.
              </li>

              <li>
                <strong>utm_content:</strong>{" "}
                Differentiates links, banners, or ad creatives.
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
              Tracking Google Ads and paid campaigns.
            </li>

            <li>
              Measuring social media traffic performance.
            </li>

            <li>
              Monitoring newsletter and email clicks.
            </li>

            <li>
              Managing affiliate and influencer campaigns.
            </li>

            <li>
              Comparing banner and CTA performance.
            </li>

            <li>
              Improving analytics reporting accuracy.
            </li>

            <li>
              Organizing multi-channel marketing campaigns.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example UTM Tracking URL
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why UTM Tracking Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better attribution:</strong>{" "}
                Understand where traffic and conversions come from.
              </li>

              <li>
                <strong>Improved campaign reporting:</strong>{" "}
                Measure performance across multiple channels.
              </li>

              <li>
                <strong>Cleaner analytics:</strong>{" "}
                Organize marketing traffic more accurately.
              </li>

              <li>
                <strong>Smarter optimization:</strong>{" "}
                Identify high-performing campaigns and ads.
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
                What are UTM parameters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                UTM parameters are tracking tags added to URLs for campaign,
                analytics, and traffic attribution reporting.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why use UTM tracking URLs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                UTM URLs help marketers measure campaign traffic, conversions,
                and performance across different channels.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does Google Analytics support UTM parameters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Google Analytics automatically recognizes and tracks
                standard UTM parameters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for SEO and paid ads?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. UTM tracking is commonly used for SEO campaigns, Google
                Ads, social media ads, newsletters, influencer traffic, and
                affiliate marketing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is UTM generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. UTM URL generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            UTM tracking often connects with SEO reporting, campaign analytics,
            paid advertising, URL management, conversion tracking, and digital
            marketing workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>

            <Link
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
            </Link>

            <Link
              href="/tools/url-query-params-parser"
              className="yoryantra-btn-outline"
            >
              URL Query Params Parser
            </Link>

            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>

            <Link
              href="/tools/qr-code-generator"
              className="yoryantra-btn-outline"
            >
              QR Code Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}