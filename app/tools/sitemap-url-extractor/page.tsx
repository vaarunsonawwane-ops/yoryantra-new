import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Sitemap URL Extractor | XML Sitemap Parser | Yoryantra",
  description:
    "Extract page, child-sitemap, and image URLs from XML sitemaps. Review lastmod, limits, malformed URLs, duplicates, and export clean lists locally.",
  keywords: [
    "sitemap URL extractor",
    "extract URLs from sitemap",
    "XML sitemap parser",
    "sitemap index extractor",
    "sitemap loc extractor",
    "image sitemap URL extractor",
    "sitemap lastmod checker",
    "technical SEO sitemap tool",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-url-extractor",
  },
  openGraph: {
    title: "Sitemap URL Extractor | XML Sitemap Parser | Yoryantra",
    description:
      "Extract and review URLs from pasted XML sitemaps and sitemap indexes, including image URLs and common protocol warnings.",
    url: "https://yoryantra.com/tools/sitemap-url-extractor",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sitemap URL Extractor | XML Sitemap Parser | Yoryantra",
    description:
      "Extract page, sitemap, and image URLs from XML sitemap content and review common sitemap issues locally.",
  },
};

export default function SitemapUrlExtractorPage() {
  return <ToolClient />;
}
