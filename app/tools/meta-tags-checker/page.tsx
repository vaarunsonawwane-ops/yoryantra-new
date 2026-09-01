import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Tags Checker | Search & Social Metadata | Yoryantra",
  description:
    "Inspect pasted HTML for title, description, canonical, robots, charset, Open Graph, X card, duplicate metadata, URL problems, and head-placement issues.",
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-tags-checker",
  },
  openGraph: {
    title: "Meta Tags Checker | Yoryantra",
    description:
      "Inspect page metadata without fake SEO scores or fixed-length rules, and review canonical, robots, social, charset, and duplicate-tag problems.",
    url: "https://yoryantra.com/tools/meta-tags-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Meta Tags Checker | Yoryantra",
    description:
      "Check search and social metadata in pasted HTML with practical implementation diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
