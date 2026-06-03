import ToolClient from "./ToolClient";

export const metadata = {
  title: "Open Graph Generator Online Free | Yoryantra",

  description:
    "Generate Open Graph meta tags instantly with this free online Open Graph Generator. Create social sharing tags for Facebook, LinkedIn, and websites.",

  keywords: [
    "open graph generator",
    "og tag generator",
    "facebook meta tags",
    "social sharing meta tags",
    "open graph meta tags",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/open-graph-generator",
  },

  openGraph: {
    title: "Open Graph Generator Online Free | Yoryantra",

    description:
      "Generate Open Graph meta tags instantly with this free online Open Graph Generator.",

    url: "https://yoryantra.com/tools/open-graph-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Open Graph Generator Online Free | Yoryantra",

    description:
      "Generate social sharing Open Graph tags instantly with this SEO tool.",
  },
};

export default function Page() {
  return <ToolClient />;
}