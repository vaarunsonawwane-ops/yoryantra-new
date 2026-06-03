import ToolClient from "./ToolClient";

export const metadata = {
  title: "Sitemap Generator Online Free | Yoryantra",

  description:
    "Generate XML sitemaps instantly with this free online Sitemap Generator. Create SEO-friendly sitemap.xml files for websites easily.",

  keywords: [
    "sitemap generator",
    "xml sitemap generator",
    "generate sitemap",
    "sitemap.xml generator",
    "seo sitemap tool",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-generator",
  },

  openGraph: {
    title: "Sitemap Generator Online Free | Yoryantra",

    description:
      "Generate XML sitemaps instantly with this free online Sitemap Generator.",

    url: "https://yoryantra.com/tools/sitemap-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Sitemap Generator Online Free | Yoryantra",

    description:
      "Generate sitemap.xml files instantly with this free SEO tool.",
  },
};

export default function Page() {
  return <ToolClient />;
}