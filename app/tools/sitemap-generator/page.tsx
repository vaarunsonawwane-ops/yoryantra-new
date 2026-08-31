import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML Sitemap Generator | Build sitemap.xml | Yoryantra",
  description:
    "Generate sitemap.xml from absolute URLs, validate sitemap entries, escape XML safely, detect duplicates, and review sitemap size limits.",
  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-generator",
  },
  openGraph: {
    title: "XML Sitemap Generator | Build sitemap.xml | Yoryantra",
    description:
      "Generate sitemap.xml from absolute URLs, validate sitemap entries, escape XML safely, detect duplicates, and review sitemap size limits.",
    url: "https://yoryantra.com/tools/sitemap-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML Sitemap Generator | Build sitemap.xml | Yoryantra",
    description:
      "Generate sitemap.xml from absolute URLs, validate sitemap entries, escape XML safely, detect duplicates, and review sitemap size limits.",
  },
};

export default function Page() {
  return <ToolClient />;
}
