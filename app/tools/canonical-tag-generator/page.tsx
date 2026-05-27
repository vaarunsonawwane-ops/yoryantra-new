import ToolClient from "./ToolClient";

export const metadata = {
  title: "Canonical Tag Generator | Create Canonical URLs Online | Yoryantra",

  description:
    "Generate canonical link tags, check canonical URL format, create HTML canonical tags, and prepare SEO canonical markup directly in your browser.",

  keywords: [
    "canonical tag generator",
    "canonical url generator",
    "canonical link tag",
    "generate canonical tag",
    "canonical tag html",
    "canonical url checker",
    "seo canonical tag",
    "technical seo tools",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/canonical-tag-generator",
  },

  openGraph: {
    title: "Canonical Tag Generator | Create Canonical URLs Online | Yoryantra",

    description:
      "Generate canonical link tags, check canonical URL format, create HTML canonical tags, and prepare SEO canonical markup directly in your browser.",

    url: "https://yoryantra.com/tools/canonical-tag-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Canonical Tag Generator | Create Canonical URLs Online | Yoryantra",

    description:
      "Generate canonical link tags, check canonical URL format, create HTML canonical tags, and prepare SEO canonical markup directly in your browser.",
  },
};

export default function CanonicalTagGeneratorPage() {
  return <ToolClient />;
}
