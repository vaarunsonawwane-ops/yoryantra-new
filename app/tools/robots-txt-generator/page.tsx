import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Robots.txt Generator | RFC 9309 Crawl Rules | Yoryantra",
  description:
    "Build robots.txt groups with User-agent, Allow, Disallow, and Sitemap records while checking product tokens, path patterns, comments, and duplicate groups.",
  alternates: {
    canonical: "https://yoryantra.com/tools/robots-txt-generator",
  },
  openGraph: {
    title: "Robots.txt Generator | Yoryantra",
    description:
      "Generate crawler groups and review RFC 9309 matching behavior without treating robots.txt as authentication or an indexing guarantee.",
    url: "https://yoryantra.com/tools/robots-txt-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Robots.txt Generator | Yoryantra",
    description:
      "Create robots.txt groups with safer path, user-agent, sitemap, and matching guidance.",
  },
};

export default function Page() {
  return <ToolClient />;
}
