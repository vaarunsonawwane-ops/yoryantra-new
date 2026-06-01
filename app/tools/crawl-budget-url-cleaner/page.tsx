import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Crawl Budget URL Cleaner | Clean SEO URL Lists Online | Yoryantra",
  description:
    "Clean URL lists for technical SEO. Remove tracking parameters, fragments, duplicate variants, trailing slash differences, empty parameters, and crawl-waste URL patterns.",
  keywords: [
    "Crawl Budget URL Cleaner",
    "SEO URL cleaner",
    "crawl budget tool",
    "URL deduplication tool",
    "clean URL list",
    "remove tracking parameters",
    "technical SEO tools",
    "SEO tools",
    "URL normalization tool",
    "crawl waste checker",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/crawl-budget-url-cleaner",
  },
  openGraph: {
    title: "Crawl Budget URL Cleaner | Clean SEO URL Lists Online | Yoryantra",
    description:
      "Clean URL lists for technical SEO. Remove tracking parameters, fragments, duplicate variants, trailing slash differences, empty parameters, and crawl-waste URL patterns.",
    url: "https://yoryantra.com/tools/crawl-budget-url-cleaner",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crawl Budget URL Cleaner | Clean SEO URL Lists Online | Yoryantra",
    description:
      "Clean URL lists for technical SEO. Remove tracking parameters, fragments, duplicate variants, trailing slash differences, empty parameters, and crawl-waste URL patterns.",
  },
};

export default function CrawlBudgetUrlCleanerPage() {
  return <ToolClient />;
}
