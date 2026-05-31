import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Robots Tag Generator | Create Robots Meta Tags Online | Yoryantra",
  description:
    "Generate meta robots tags and X-Robots-Tag header values for indexing, following links, snippets, images, archives, translations, and search preview controls.",
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
    title: "Meta Robots Tag Generator | Create Robots Meta Tags Online | Yoryantra",
    description:
      "Generate meta robots tags and X-Robots-Tag header values for indexing, following links, snippets, images, archives, translations, and search preview controls.",
    url: "https://yoryantra.com/tools/meta-robots-tag-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Robots Tag Generator | Create Robots Meta Tags Online | Yoryantra",
    description:
      "Generate meta robots tags and X-Robots-Tag header values for indexing, following links, snippets, images, archives, translations, and search preview controls.",
  },
};

export default function MetaRobotsTagGeneratorPage() {
  return <ToolClient />;
}
