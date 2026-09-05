import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "SEO Slug Analyzer | Review URL Path Structure | Yoryantra",
  description:
    "Review URL slugs for readability, hyphens, casing, percent encoding, length heuristics, and topic wording without treating scores as ranking signals.",
  keywords: [
    "SEO slug analyzer",
    "URL slug checker",
    "URL structure SEO",
    "hyphen underscore URL",
    "URL readability",
    "percent encoded slug",
    "technical SEO URL path",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/seo-slug-analyzer",
  },
  openGraph: {
    title: "SEO Slug Analyzer | Review URL Path Structure | Yoryantra",
    description:
      "Review URL slugs for readability, hyphens, casing, percent encoding, length heuristics, and topic wording without treating scores as ranking signals.",
    url: "https://yoryantra.com/tools/seo-slug-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Slug Analyzer | Review URL Path Structure | Yoryantra",
    description:
      "Review URL slugs for readability, hyphens, casing, percent encoding, length heuristics, and topic wording without treating scores as ranking signals.",
  },
};

export default function Page() {
  return <ToolClient />;
}
