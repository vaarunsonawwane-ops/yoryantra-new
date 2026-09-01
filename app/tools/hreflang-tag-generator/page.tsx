import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Hreflang Tag Generator | HTML, Header & Sitemap | Yoryantra",
  description:
    "Build hreflang alternate sets for localized pages, validate language and region codes, add x-default, and generate HTML, HTTP Link header, or sitemap markup.",
  alternates: {
    canonical: "https://yoryantra.com/tools/hreflang-tag-generator",
  },
  openGraph: {
    title: "Hreflang Tag Generator | HTML, Header & Sitemap | Yoryantra",
    description:
      "Create complete hreflang alternate sets with code checks, x-default, duplicate diagnostics, and implementation guidance.",
    url: "https://yoryantra.com/tools/hreflang-tag-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hreflang Tag Generator | Yoryantra",
    description:
      "Generate hreflang markup for localized pages without losing self-references, x-default, or alternate-set consistency.",
  },
};

export default function Page() {
  return <ToolClient />;
}
