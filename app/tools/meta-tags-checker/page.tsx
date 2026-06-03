import ToolClient from "./ToolClient";

export const metadata = {
  title: "Meta Tags Checker | Check Page Meta Tags Online | Yoryantra",

  description:
    "Check HTML meta tags, title tags, meta descriptions, canonical links, Open Graph tags, and Twitter card tags directly in your browser.",

  keywords: [
    "meta tags checker",
    "check meta tags",
    "meta tag checker",
    "title tag checker",
    "meta description checker",
    "open graph checker",
    "twitter card checker",
    "canonical tag checker",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/meta-tags-checker",
  },

  openGraph: {
    title: "Meta Tags Checker | Check Page Meta Tags Online | Yoryantra",

    description:
      "Check HTML meta tags, title tags, meta descriptions, canonical links, Open Graph tags, and Twitter card tags directly in your browser.",

    url: "https://yoryantra.com/tools/meta-tags-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Meta Tags Checker | Check Page Meta Tags Online | Yoryantra",

    description:
      "Check HTML meta tags, title tags, meta descriptions, canonical links, Open Graph tags, and Twitter card tags directly in your browser.",
  },
};

export default function MetaTagsCheckerPage() {
  return <ToolClient />;
}
