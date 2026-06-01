import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Title Tag Length Checker | Check SEO Title Length Online | Yoryantra",
  description:
    "Check SEO title tag length, truncation risk, keyword placement, brand placement, separators, duplicates, and SERP-style title preview directly in your browser.",
  keywords: [
    "Title Tag Length Checker",
    "SEO title checker",
    "title tag checker",
    "meta title length checker",
    "SEO title length",
    "SERP title preview",
    "title tag analyzer",
    "technical SEO tools",
    "SEO tools",
    "Google title length checker",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/title-tag-length-checker",
  },
  openGraph: {
    title: "Title Tag Length Checker | Check SEO Title Length Online | Yoryantra",
    description:
      "Check SEO title tag length, truncation risk, keyword placement, brand placement, separators, duplicates, and SERP-style title preview directly in your browser.",
    url: "https://yoryantra.com/tools/title-tag-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Title Tag Length Checker | Check SEO Title Length Online | Yoryantra",
    description:
      "Check SEO title tag length, truncation risk, keyword placement, brand placement, separators, duplicates, and SERP-style title preview directly in your browser.",
  },
};

export default function TitleTagLengthCheckerPage() {
  return <ToolClient />;
}
