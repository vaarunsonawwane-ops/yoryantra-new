import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Sitemap URL Extractor | Extract URLs From XML Sitemaps Online | Yoryantra",
  description:
    "Extract URLs from XML sitemaps and sitemap indexes. Parse loc, lastmod, changefreq, priority, image URLs, and export clean URL lists directly in your browser.",
  keywords: [
    "Sitemap URL Extractor",
    "extract URLs from sitemap",
    "XML sitemap URL extractor",
    "sitemap parser",
    "sitemap URL list",
    "sitemap index extractor",
    "extract loc from sitemap",
    "technical SEO tools",
    "SEO tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-url-extractor",
  },
  openGraph: {
    title: "Sitemap URL Extractor | Extract URLs From XML Sitemaps Online | Yoryantra",
    description:
      "Extract URLs from XML sitemaps and sitemap indexes. Parse loc, lastmod, changefreq, priority, image URLs, and export clean URL lists directly in your browser.",
    url: "https://yoryantra.com/tools/sitemap-url-extractor",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sitemap URL Extractor | Extract URLs From XML Sitemaps Online | Yoryantra",
    description:
      "Extract URLs from XML sitemaps and sitemap indexes. Parse loc, lastmod, changefreq, priority, image URLs, and export clean URL lists directly in your browser.",
  },
};

export default function SitemapURLExtractorPage() {
  return <ToolClient />;
}
