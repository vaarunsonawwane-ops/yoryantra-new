import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Indexability Checker | HTML & Header Signals | Yoryantra",
  description:
    "Inspect pasted HTML and response headers for noindex, X-Robots-Tag, HTTP status, canonical, nofollow, and meta refresh without fetching the page.",
  keywords: [
    "indexability checker",
    "noindex checker",
    "X-Robots-Tag checker",
    "robots meta checker",
    "canonical signal checker",
    "HTTP status SEO",
    "technical SEO indexing",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/indexability-checker",
  },
  openGraph: {
    title: "Indexability Checker | HTML & Header Signals | Yoryantra",
    description:
      "Inspect pasted HTML and response headers for noindex, X-Robots-Tag, HTTP status, canonical, nofollow, and meta refresh without fetching the page.",
    url: "https://yoryantra.com/tools/indexability-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indexability Checker | HTML & Header Signals | Yoryantra",
    description:
      "Inspect pasted HTML and response headers for noindex, X-Robots-Tag, HTTP status, canonical, nofollow, and meta refresh without fetching the page.",
  },
};

export default function Page() {
  return <ToolClient />;
}
