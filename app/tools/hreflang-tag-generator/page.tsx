import ToolClient from "./ToolClient";

export const metadata = {
  title: "Hreflang Tag Generator | HTML, Header & Sitemap | Yoryantra",
  description:
    "Generate and validate hreflang annotations for localized pages as HTML link tags, HTTP Link headers, or sitemap xhtml:link entries.",
  alternates: {
    canonical: "https://yoryantra.com/tools/hreflang-tag-generator",
  },
  openGraph: {
    title: "Hreflang Tag Generator | HTML, Header & Sitemap",
    description:
      "Build hreflang annotations with language/region checks, x-default, absolute URL validation, and duplicate diagnostics.",
    url: "https://yoryantra.com/tools/hreflang-tag-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hreflang Tag Generator | Yoryantra",
    description:
      "Generate validated hreflang annotations for HTML, HTTP headers, and XML sitemaps.",
  },
};

export default function Page() {
  return <ToolClient />;
}
