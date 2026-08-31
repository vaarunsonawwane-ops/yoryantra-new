import ToolClient from "./ToolClient";

export const metadata = {
  title: "Open Graph Generator | Create OG Meta Tags | Yoryantra",
  description:
    "Generate escaped Open Graph meta tags for titles, URLs, images, descriptions, locales, site names, and social sharing metadata.",
  alternates: {
    canonical: "https://yoryantra.com/tools/open-graph-generator",
  },
  openGraph: {
    title: "Open Graph Generator | Create OG Meta Tags | Yoryantra",
    description:
      "Generate escaped Open Graph meta tags for titles, URLs, images, descriptions, locales, site names, and social sharing metadata.",
    url: "https://yoryantra.com/tools/open-graph-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Graph Generator | Create OG Meta Tags | Yoryantra",
    description:
      "Generate escaped Open Graph meta tags for titles, URLs, images, descriptions, locales, site names, and social sharing metadata.",
  },
};

export default function Page() {
  return <ToolClient />;
}
