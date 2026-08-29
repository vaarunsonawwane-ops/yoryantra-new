import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Title Tag Length Checker – Preview SEO Titles | Yoryantra",
  description:
    "Review title tag text, estimated display width, duplicate titles, target phrase and brand placement, separators, and SERP-style previews in your browser.",
  alternates: {
    canonical: "https://yoryantra.com/tools/title-tag-length-checker",
  },
  openGraph: {
    title: "Title Tag Length Checker – Preview SEO Titles | Yoryantra",
    description:
      "Review title text, estimated display width, duplicate patterns, target phrases, brand placement, separators, and SERP-style previews.",
    url: "https://yoryantra.com/tools/title-tag-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Title Tag Length Checker – Preview SEO Titles | Yoryantra",
    description:
      "Review title length, estimated display width, duplicates, target phrases, brand placement, and SERP-style previews.",
  },
};

export default function TitleTagLengthCheckerPage() {
  return <ToolClient />;
}
