import ToolClient from "./ToolClient";

export const metadata = {
  title: "Robots.txt Generator Online Free | Yoryantra",

  description:
    "Generate robots.txt files instantly with this free online Robots.txt Generator. Create crawl rules, sitemap links, and search engine directives easily.",

  keywords: [
    "robots.txt generator",
    "robots txt generator",
    "generate robots.txt",
    "robots.txt file",
    "seo tools",
    "website crawler rules",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/robots-txt-generator",
  },

  openGraph: {
    title: "Robots.txt Generator Online Free | Yoryantra",
    description:
      "Generate robots.txt files instantly with this free online Robots.txt Generator.",
    url: "https://yoryantra.com/tools/robots-txt-generator",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Robots.txt Generator Online Free | Yoryantra",
    description:
      "Create robots.txt crawl rules instantly with this free SEO tool.",
  },
};

export default function Page() {
  return <ToolClient />;
}