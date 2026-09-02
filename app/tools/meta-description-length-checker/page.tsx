import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Description Length Checker | Snippet Review | Yoryantra",
  description:
    "Review one or many meta descriptions for character length, words, duplicates, generic wording and optional topic usage while keeping Google snippet rewriting and truncation limits explicit.",
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-description-length-checker",
  },
  openGraph: {
    title: "Meta Description Length Checker | Yoryantra",
    description:
      "Audit meta descriptions with editing heuristics, duplicate detection and snippet-writing guidance without claiming a fixed Google character limit.",
    url: "https://yoryantra.com/tools/meta-description-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Meta Description Length Checker | Yoryantra",
    description:
      "Check description length, duplicates and wording quality while treating snippet length as a display heuristic rather than an SEO rule.",
  },
};

export default function Page() {
  return <ToolClient />;
}
