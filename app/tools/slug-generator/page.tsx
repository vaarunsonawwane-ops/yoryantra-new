import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Slug Generator | Unicode and ASCII URL Slugs",
  description:
    "Turn titles into lowercase hyphenated slugs, keep readable Unicode or choose ASCII-only output, and inspect the percent-encoded URL path segment.",
  alternates: {
    canonical: "https://yoryantra.com/tools/slug-generator",
  },
  openGraph: {
    title: "Slug Generator | Yoryantra",
    description:
      "Build lowercase hyphenated URL slugs with Unicode-preserving or ASCII-only output.",
    url: "https://yoryantra.com/tools/slug-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Slug Generator | Yoryantra",
    description:
      "Create readable URL slugs and compare Unicode text with its encoded path form.",
  },
};

export default function SlugGeneratorPage() {
  return <ToolClient />;
}
