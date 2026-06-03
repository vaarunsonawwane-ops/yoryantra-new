import ToolClient from "./ToolClient";

export const metadata = {
  title: "Open Graph Preview Checker | Check OG Tags Online | Yoryantra",

  description:
    "Check Open Graph tags from HTML, preview social sharing details, inspect og:title, og:description, og:image, og:url, and Twitter card tags in your browser.",

  keywords: [
    "open graph preview checker",
    "open graph checker",
    "og tag checker",
    "og preview tool",
    "social preview checker",
    "check open graph tags",
    "twitter card checker",
    "open graph validator",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/open-graph-preview-checker",
  },

  openGraph: {
    title: "Open Graph Preview Checker | Check OG Tags Online | Yoryantra",

    description:
      "Check Open Graph tags from HTML, preview social sharing details, inspect og:title, og:description, og:image, og:url, and Twitter card tags in your browser.",

    url: "https://yoryantra.com/tools/open-graph-preview-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Open Graph Preview Checker | Check OG Tags Online | Yoryantra",

    description:
      "Check Open Graph tags from HTML, preview social sharing details, inspect og:title, og:description, og:image, og:url, and Twitter card tags in your browser.",
  },
};

export default function OpenGraphPreviewCheckerPage() {
  return <ToolClient />;
}
