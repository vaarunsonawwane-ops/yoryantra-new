import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Heading Structure Checker | Check H1 H2 H3 SEO Outline Online | Yoryantra",
  description:
    "Check HTML heading structure for SEO and readability. Analyze H1, H2, H3, skipped heading levels, duplicate headings, empty headings, and page outline issues directly in your browser.",
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
    title: "Heading Structure Checker | Check H1 H2 H3 SEO Outline Online | Yoryantra",
    description:
      "Check HTML heading structure for SEO and readability. Analyze H1, H2, H3, skipped heading levels, duplicate headings, empty headings, and page outline issues directly in your browser.",
    url: "https://yoryantra.com/tools/heading-structure-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Heading Structure Checker | Check H1 H2 H3 SEO Outline Online | Yoryantra",
    description:
      "Check HTML heading structure for SEO and readability. Analyze H1, H2, H3, skipped heading levels, duplicate headings, empty headings, and page outline issues directly in your browser.",
  },
};

export default function HeadingStructureCheckerPage() {
  return <ToolClient />;
}
