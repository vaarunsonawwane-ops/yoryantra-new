import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "SEO Slug Analyzer for URL Readability Checks | Yoryantra",
  description:
    "Review URL slugs for readability, casing, separators, length, repeated characters, optional keyword presence, and cleaner slug suggestions.",
  keywords: [
    "SEO Slug Analyzer",
    "URL slug checker",
    "SEO friendly URL checker",
    "slug length checker",
    "URL slug analyzer",
    "clean URL checker",
    "SEO URL checker",
    "technical SEO tools",
    "SEO tools",
    "slug optimization tool",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/seo-slug-analyzer",
  },
  openGraph: {
    title: "SEO Slug Analyzer for URL Readability Checks | Yoryantra",
    description:
      "Review URL slugs for readability, casing, separators, length, repeated characters, optional keyword presence, and cleaner slug suggestions.",
    url: "https://yoryantra.com/tools/seo-slug-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Slug Analyzer for URL Readability Checks | Yoryantra",
    description:
      "Review URL slugs for readability, casing, separators, length, repeated characters, optional keyword presence, and cleaner slug suggestions.",
  },
};

export default function SeoSlugAnalyzerPage() {
  return <ToolClient />;
}
