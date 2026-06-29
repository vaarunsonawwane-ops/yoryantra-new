import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Description Checker – Length & SERP Preview | Yoryantra",
  description:
    "Check meta description length, estimated pixel width, truncation risk, keyword use, duplicate text, and Google-style desktop or mobile snippet previews.",
  keywords: [
    "Meta Description Length Checker",
    "meta description checker",
    "meta description check",
    "meta description length",
    "meta description length checker",
    "check meta description",
    "meta desc checker",
    "Google meta description length",
    "SEO description checker",
    "SERP description preview",
    "meta tag description checker",
    "SEO snippet checker",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-description-length-checker",
  },
  openGraph: {
    title: "Meta Description Checker – Length & SERP Preview | Yoryantra",
    description:
      "Check meta description length, estimated pixel width, truncation risk, keyword use, duplicate text, and Google-style desktop or mobile snippet previews.",
    url: "https://yoryantra.com/tools/meta-description-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Description Checker – Length & SERP Preview | Yoryantra",
    description:
      "Check meta description length, estimated pixel width, truncation risk, keyword use, duplicate text, and Google-style desktop or mobile snippet previews.",
  },
};

export default function MetaDescriptionLengthCheckerPage() {
  return <ToolClient />;
}
