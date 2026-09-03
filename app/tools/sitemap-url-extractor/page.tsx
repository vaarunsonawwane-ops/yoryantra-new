import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Sitemap URL Extractor | XML URL & Index Parser | Yoryantra",
  description:
    "Parse urlset and sitemapindex XML, extract core and image URLs, review namespaces, lastmod values, duplicates and file limits, and export filtered results.",
  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-url-extractor",
  },
  openGraph: {
    title: "Sitemap URL Extractor | Yoryantra",
    description:
      "Read sitemap XML without mixing page URLs, child sitemap URLs and image-extension URLs, then review protocol-level issues before export.",
    url: "https://yoryantra.com/tools/sitemap-url-extractor",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sitemap URL Extractor | Yoryantra",
    description:
      "Parse sitemap XML, separate page, sitemap and image URLs, and review namespaces, dates, duplicates and protocol limits.",
  },
};

export default function Page() {
  return <ToolClient />;
}
