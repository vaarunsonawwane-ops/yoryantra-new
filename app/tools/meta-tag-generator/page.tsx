import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Meta Tag Generator | Search, Canonical & Social Tags | Yoryantra",
  description:
    "Generate escaped title, description, canonical, robots, Open Graph, and X card markup with URL checks, tracking warnings, and search-preview guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/meta-tag-generator",
  },
  openGraph: {
    title: "Meta Tag Generator | Yoryantra",
    description:
      "Create safe-to-copy search and social metadata without obsolete meta-keywords output or fake fixed-length SEO scoring.",
    url: "https://yoryantra.com/tools/meta-tag-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meta Tag Generator | Yoryantra",
    description:
      "Generate title, description, canonical, robots, Open Graph, and X card markup locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
