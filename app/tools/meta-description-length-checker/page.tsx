import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Description Length Checker | Check SEO Description Length Online | Yoryantra",
  description:
    "Check meta description length, truncation risk, keyword usage, duplicate descriptions, CTA wording, empty descriptions, and SERP-style snippet preview directly in your browser.",
  keywords: [
    "Meta Description Length Checker",
    "meta description checker",
    "SEO description checker",
    "meta description length",
    "SERP description preview",
    "meta tag description checker",
    "SEO snippet checker",
    "technical SEO tools",
    "SEO tools",
    "Google meta description checker",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-description-length-checker",
  },
  openGraph: {
    title: "Meta Description Length Checker | Check SEO Description Length Online | Yoryantra",
    description:
      "Check meta description length, truncation risk, keyword usage, duplicate descriptions, CTA wording, empty descriptions, and SERP-style snippet preview directly in your browser.",
    url: "https://yoryantra.com/tools/meta-description-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Description Length Checker | Check SEO Description Length Online | Yoryantra",
    description:
      "Check meta description length, truncation risk, keyword usage, duplicate descriptions, CTA wording, empty descriptions, and SERP-style snippet preview directly in your browser.",
  },
};

export default function MetaDescriptionLengthCheckerPage() {
  return <ToolClient />;
}
