import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "SEO Slug Analyzer | Check URL Slug Quality Online | Yoryantra",
  description:
    "Analyze SEO-friendly URL slugs for length, keywords, hyphens, underscores, uppercase letters, stop words, special characters, duplicate slashes, and clean URL readability.",
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
    title: "SEO Slug Analyzer | Check URL Slug Quality Online | Yoryantra",
    description:
      "Analyze SEO-friendly URL slugs for length, keywords, hyphens, underscores, uppercase letters, stop words, special characters, duplicate slashes, and clean URL readability.",
    url: "https://yoryantra.com/tools/seo-slug-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Slug Analyzer | Check URL Slug Quality Online | Yoryantra",
    description:
      "Analyze SEO-friendly URL slugs for length, keywords, hyphens, underscores, uppercase letters, stop words, special characters, duplicate slashes, and clean URL readability.",
  },
};

export default function SeoSlugAnalyzerPage() {
  return <ToolClient />;
}
