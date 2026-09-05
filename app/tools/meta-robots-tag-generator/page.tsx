import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Robots Tag Generator | Robots Meta & X-Robots-Tag | Yoryantra",
  description:
    "Build robots meta and X-Robots-Tag directives for indexing, link following, snippets, previews, and expiry.",
  keywords: [
    "Meta Robots Tag Generator",
    "robots meta tag generator",
    "meta robots generator",
    "X-Robots-Tag generator",
    "noindex nofollow generator",
    "SEO robots tag",
    "index follow meta tag",
    "technical SEO tools",
    "SEO tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-robots-tag-generator",
  },
  openGraph: {
    title: "Meta Robots Tag Generator | Robots Meta & X-Robots-Tag | Yoryantra",
    description:
      "Build robots meta and X-Robots-Tag directives for indexing, link following, snippets, previews, and expiry.",
    url: "https://yoryantra.com/tools/meta-robots-tag-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Robots Tag Generator | Robots Meta & X-Robots-Tag | Yoryantra",
    description:
      "Build robots meta and X-Robots-Tag directives for indexing, link following, snippets, previews, and expiry.",
  },
};

export default function MetaRobotsTagGeneratorPage() {
  return <ToolClient />;
}
