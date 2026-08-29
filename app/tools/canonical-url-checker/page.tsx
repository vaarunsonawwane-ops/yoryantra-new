import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Canonical URL Checker | Compare Canonical Tags | Yoryantra",
  description:
    "Compare a page URL with its canonical target and review host, path, query, fragment, relative URL, HTTPS, and tracking-parameter differences locally.",
  keywords: [
    "canonical URL checker",
    "canonical tag checker",
    "rel canonical checker",
    "canonical URL validator",
    "self canonical checker",
    "cross domain canonical checker",
    "technical SEO canonical",
    "canonical URL comparison",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/canonical-url-checker",
  },
  openGraph: {
    title: "Canonical URL Checker | Compare Canonical Tags | Yoryantra",
    description:
      "Compare page and canonical URLs, inspect important differences, and catch common canonicalization mistakes without fetching the page.",
    url: "https://yoryantra.com/tools/canonical-url-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canonical URL Checker | Compare Canonical Tags | Yoryantra",
    description:
      "Review self-referencing, alternate, relative, cross-domain, fragment, and parameter canonical URLs locally.",
  },
};

export default function CanonicalUrlCheckerPage() {
  return <ToolClient />;
}
