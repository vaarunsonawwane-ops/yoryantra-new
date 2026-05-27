import ToolClient from "./ToolClient";

export const metadata = {
  title: "Sitemap Validator | Check XML Sitemap Online | Yoryantra",

  description:
    "Validate XML sitemap syntax, inspect sitemap URLs, check loc, lastmod, changefreq, priority values, and find common sitemap issues directly in your browser.",

  keywords: [
    "sitemap validator",
    "xml sitemap validator",
    "sitemap checker",
    "validate sitemap",
    "sitemap xml checker",
    "check sitemap urls",
    "sitemap syntax checker",
    "technical seo tools",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-validator",
  },

  openGraph: {
    title: "Sitemap Validator | Check XML Sitemap Online | Yoryantra",

    description:
      "Validate XML sitemap syntax, inspect sitemap URLs, check loc, lastmod, changefreq, priority values, and find common sitemap issues directly in your browser.",

    url: "https://yoryantra.com/tools/sitemap-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Sitemap Validator | Check XML Sitemap Online | Yoryantra",

    description:
      "Validate XML sitemap syntax, inspect sitemap URLs, check loc, lastmod, changefreq, priority values, and find common sitemap issues directly in your browser.",
  },
};

export default function SitemapValidatorPage() {
  return <ToolClient />;
}
