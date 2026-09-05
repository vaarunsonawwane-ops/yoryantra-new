import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Heading Structure Checker | Review H1-H6 Hierarchy | Yoryantra",
  description:
    "Review HTML heading hierarchy, H1 usage, skipped levels, duplicates, empty headings, and outline structure.",
  keywords: [
    "Heading Structure Checker",
    "H1 H2 H3 checker",
    "SEO heading checker",
    "HTML heading checker",
    "heading hierarchy checker",
    "H1 tag checker",
    "page outline checker",
    "technical SEO tools",
    "SEO tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/heading-structure-checker",
  },
  openGraph: {
    title: "Heading Structure Checker | Review H1-H6 Hierarchy | Yoryantra",
    description:
      "Review HTML heading hierarchy, H1 usage, skipped levels, duplicates, empty headings, and outline structure.",
    url: "https://yoryantra.com/tools/heading-structure-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Heading Structure Checker | Review H1-H6 Hierarchy | Yoryantra",
    description:
      "Review HTML heading hierarchy, H1 usage, skipped levels, duplicates, empty headings, and outline structure.",
  },
};

export default function HeadingStructureCheckerPage() {
  return <ToolClient />;
}
