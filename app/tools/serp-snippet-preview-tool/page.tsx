import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "SERP Snippet Preview Tool | Preview Google Search Result Snippets | Yoryantra",
  description:
    "Preview how page titles, meta descriptions, URLs, site names, and search snippets may appear in Google-style results. Check title length, description length, truncation, and SEO snippet issues.",
  keywords: [
    "SERP Snippet Preview Tool",
    "Google snippet preview",
    "SERP preview",
    "meta title preview",
    "meta description preview",
    "search result preview",
    "SEO title checker",
    "meta description checker",
    "technical SEO tools",
    "SEO tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/serp-snippet-preview-tool",
  },
  openGraph: {
    title: "SERP Snippet Preview Tool | Preview Google Search Result Snippets | Yoryantra",
    description:
      "Preview how page titles, meta descriptions, URLs, site names, and search snippets may appear in Google-style results. Check title length, description length, truncation, and SEO snippet issues.",
    url: "https://yoryantra.com/tools/serp-snippet-preview-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SERP Snippet Preview Tool | Preview Google Search Result Snippets | Yoryantra",
    description:
      "Preview how page titles, meta descriptions, URLs, site names, and search snippets may appear in Google-style results. Check title length, description length, truncation, and SEO snippet issues.",
  },
};

export default function SERPSnippetPreviewToolPage() {
  return <ToolClient />;
}
