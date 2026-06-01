import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Indexability Checker | Check Noindex, Canonical and Robots Meta Tags | Yoryantra",
  description:
    "Check whether a page looks indexable from pasted HTML and headers. Detect noindex, nofollow, robots meta tags, X-Robots-Tag, canonical conflicts, meta refresh, and indexing blockers.",
  keywords: [
    "Indexability Checker",
    "SEO indexability checker",
    "noindex checker",
    "robots meta tag checker",
    "X-Robots-Tag checker",
    "canonical indexability checker",
    "Google indexing checker",
    "technical SEO tools",
    "SEO tools",
    "page indexability analyzer",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/indexability-checker",
  },
  openGraph: {
    title: "Indexability Checker | Check Noindex, Canonical and Robots Meta Tags | Yoryantra",
    description:
      "Check whether a page looks indexable from pasted HTML and headers. Detect noindex, nofollow, robots meta tags, X-Robots-Tag, canonical conflicts, meta refresh, and indexing blockers.",
    url: "https://yoryantra.com/tools/indexability-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indexability Checker | Check Noindex, Canonical and Robots Meta Tags | Yoryantra",
    description:
      "Check whether a page looks indexable from pasted HTML and headers. Detect noindex, nofollow, robots meta tags, X-Robots-Tag, canonical conflicts, meta refresh, and indexing blockers.",
  },
};

export default function IndexabilityCheckerPage() {
  return <ToolClient />;
}
