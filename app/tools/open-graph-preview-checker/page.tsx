import ToolClient from "./ToolClient";

export const metadata = {
  title: "Open Graph Checker & Social Preview Tool | Yoryantra",

  description:
    "Check Open Graph tags from HTML, preview social sharing metadata, and inspect og:title, og:description, og:image, og:url, and Twitter card tags.",

  keywords: [
    "open graph checker",
    "open graph check",
    "open graph tester",
    "open graph preview checker",
    "OG tag checker",
    "OG preview tool",
    "social media preview checker",
    "check open graph tags",
    "Twitter card checker",
    "open graph validator",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/open-graph-preview-checker",
  },

  openGraph: {
    title: "Open Graph Checker & Social Preview Tool | Yoryantra",

    description:
      "Check Open Graph tags from HTML, preview social sharing metadata, and inspect og:title, og:description, og:image, og:url, and Twitter card tags.",

    url: "https://yoryantra.com/tools/open-graph-preview-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Open Graph Checker & Social Preview Tool | Yoryantra",

    description:
      "Check Open Graph tags from HTML, preview social sharing metadata, and inspect og:title, og:description, og:image, og:url, and Twitter card tags.",
  },
};

export default function OpenGraphPreviewCheckerPage() {
  return <ToolClient />;
}
