import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Description Length Checker | Snippet Review | Yoryantra",
  description:
    "Review meta descriptions from text, lists or HTML for length, duplicate wording, empty tags and phrase repetition without treating character counts as Google limits.",
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-description-length-checker",
  },
  openGraph: {
    title: "Meta Description Length Checker | Yoryantra",
    description:
      "Review description length, duplicates and HTML metadata while keeping Google snippet rewriting and device-dependent truncation explicit.",
    url: "https://yoryantra.com/tools/meta-description-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Meta Description Length Checker | Yoryantra",
    description:
      "Review meta description length, duplicate wording and HTML tags without treating a character range as an SEO rule.",
  },
};

export default function Page() {
  return <ToolClient />;
}
