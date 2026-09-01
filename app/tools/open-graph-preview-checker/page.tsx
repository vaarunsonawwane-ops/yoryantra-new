import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Open Graph Preview Checker | Social Metadata | Yoryantra",
  description:
    "Inspect Open Graph and X card metadata for duplicates, fallbacks, relative URLs, canonical mismatches, image details, and approximate preview content.",
  alternates: {
    canonical: "https://yoryantra.com/tools/open-graph-preview-checker",
  },
  openGraph: {
    title: "Open Graph Preview Checker | Yoryantra",
    description:
      "Review declared social metadata separately from HTML fallbacks and see what a sharing card may use without claiming to emulate a platform.",
    url: "https://yoryantra.com/tools/open-graph-preview-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Open Graph Preview Checker | Yoryantra",
    description:
      "Inspect Open Graph and X card markup from pasted HTML and catch common implementation conflicts.",
  },
};

export default function Page() {
  return <ToolClient />;
}
