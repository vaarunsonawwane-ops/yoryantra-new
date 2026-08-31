import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Tag Generator | SEO, Open Graph & X Cards | Yoryantra",
  description:
    "Generate escaped title, description, canonical, Open Graph, and X card markup with URL checks and practical search-preview guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-tag-generator",
  },
  openGraph: {
    title: "Meta Tag Generator | Yoryantra",
    description:
      "Create safe-to-copy SEO and social metadata without obsolete meta-keywords markup or fixed-length SEO scoring.",
    url: "https://yoryantra.com/tools/meta-tag-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Tag Generator | Yoryantra",
    description:
      "Generate title, description, canonical, Open Graph, and X card markup locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
