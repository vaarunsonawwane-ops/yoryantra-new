import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "SERP Snippet Preview | Title & Meta Description | Yoryantra",
  description:
    "Preview a search-result style title, description, URL, and site name while reviewing metadata clarity and approximate truncation without fixed-limit claims.",
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
    title: "SERP Snippet Preview | Title & Meta Description | Yoryantra",
    description:
      "Preview a search-result style title, description, URL, and site name while reviewing metadata clarity and approximate truncation without fixed-limit claims.",
    url: "https://yoryantra.com/tools/serp-snippet-preview-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SERP Snippet Preview | Title & Meta Description | Yoryantra",
    description:
      "Preview a search-result style title, description, URL, and site name while reviewing metadata clarity and approximate truncation without fixed-limit claims.",
  },
};

export default function SERPSnippetPreviewToolPage() {
  return <ToolClient />;
}
