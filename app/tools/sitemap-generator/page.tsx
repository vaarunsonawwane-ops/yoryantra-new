import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "XML Sitemap Generator | URLs, lastmod & Limits | Yoryantra",
  description:
    "Generate sitemap.xml from absolute URLs with XML escaping, scope checks, duplicate handling, optional lastmod validation, URL limits, and UTF-8 size checks.",
  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-generator",
  },
  openGraph: {
    title: "XML Sitemap Generator | Yoryantra",
    description:
      "Build sitemap.xml safely and review URL scope, lastmod meaning, duplicate entries, sitemap limits, and submission boundaries.",
    url: "https://yoryantra.com/tools/sitemap-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "XML Sitemap Generator | Yoryantra",
    description:
      "Generate standards-aware sitemap XML without crawling or inventing modification dates.",
  },
};

export default function Page() {
  return <ToolClient />;
}
