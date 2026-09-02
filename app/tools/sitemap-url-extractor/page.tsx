import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Sitemap URL Extractor | XML URL & Index Parser | Yoryantra",
  description:
    "Extract page, child-sitemap and image URLs from sitemap XML with namespace-aware parsing, metadata, duplicate handling, sorting, filters and protocol diagnostics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-url-extractor",
  },
  openGraph: {
    title: "Sitemap URL Extractor | Yoryantra",
    description:
      "Parse sitemap urlset or sitemapindex XML locally and export URLs without confusing extension loc elements with core sitemap entries.",
    url: "https://yoryantra.com/tools/sitemap-url-extractor",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sitemap URL Extractor | Yoryantra",
    description:
      "Extract sitemap page, index and image URLs with metadata, deduplication, filters and XML diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
