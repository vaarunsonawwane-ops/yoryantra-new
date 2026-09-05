import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Crawl Budget URL Cleaner | URL List Cleanup | Yoryantra",
  description:
    "Normalize crawl and log URL lists by removing selected tracking noise, fragments, duplicate variants, and flagged paths without fetching live URLs.",
  keywords: [
    "crawl budget URL cleaner",
    "crawl export cleanup",
    "SEO URL normalization",
    "tracking parameter cleanup",
    "duplicate URL audit",
    "crawl log URL cleanup",
    "technical SEO URL list",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/crawl-budget-url-cleaner",
  },
  openGraph: {
    title: "Crawl Budget URL Cleaner | URL List Cleanup | Yoryantra",
    description:
      "Normalize crawl and log URL lists by removing selected tracking noise, fragments, duplicate variants, and flagged paths without fetching live URLs.",
    url: "https://yoryantra.com/tools/crawl-budget-url-cleaner",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crawl Budget URL Cleaner | URL List Cleanup | Yoryantra",
    description:
      "Normalize crawl and log URL lists by removing selected tracking noise, fragments, duplicate variants, and flagged paths without fetching live URLs.",
  },
};

export default function Page() {
  return <ToolClient />;
}
