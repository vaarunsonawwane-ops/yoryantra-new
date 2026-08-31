import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Description Length Checker | SERP Preview | Yoryantra",
  description:
    "Review meta description length, approximate visual width, duplicates, target-topic use, generic wording, and desktop or mobile snippet previews locally.",
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-description-length-checker",
  },
  openGraph: {
    title: "Meta Description Length Checker | SERP Preview | Yoryantra",
    description:
      "Review meta description length, duplicates, wording, and illustrative search-snippet previews without uploading the text.",
    url: "https://yoryantra.com/tools/meta-description-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Description Length Checker | SERP Preview | Yoryantra",
    description:
      "Check description length, duplicates, target-topic use, and snippet-preview risk locally.",
  },
};

export default function MetaDescriptionLengthCheckerPage() {
  return <ToolClient />;
}
