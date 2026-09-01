import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Open Graph Generator | Social Sharing Metadata | Yoryantra",
  description:
    "Generate escaped Open Graph metadata with required-property checks, URL validation, image details, locale handling, and practical social-sharing guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/open-graph-generator",
  },
  openGraph: {
    title: "Open Graph Generator | Yoryantra",
    description:
      "Create Open Graph title, type, image, URL, description, site name, locale, and structured image metadata for social sharing.",
    url: "https://yoryantra.com/tools/open-graph-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Open Graph Generator | Yoryantra",
    description:
      "Generate practical Open Graph metadata without pretending every platform renders the same preview.",
  },
};

export default function Page() {
  return <ToolClient />;
}
