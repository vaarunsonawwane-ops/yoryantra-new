import ToolClient from "./ToolClient";

export const metadata = {
  title: "Redirect Chain Checker Online Free | Yoryantra",

  description:
    "Analyze redirect chains, redirect hops, status codes, loops, and final destination URLs for technical SEO debugging.",

  keywords: [
    "redirect chain checker",
    "redirect checker",
    "301 redirect checker",
    "302 redirect checker",
    "redirect hops checker",
    "technical seo tools",
    "seo redirect checker",
    "url redirect checker",
    "redirect loop checker",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/redirect-chain-checker",
  },

  openGraph: {
    title: "Redirect Chain Checker Online Free | Yoryantra",

    description:
      "Analyze redirect chains, redirect hops, loops, and final destination URLs for SEO and debugging workflows.",

    url: "https://yoryantra.com/tools/redirect-chain-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Redirect Chain Checker Online Free | Yoryantra",

    description:
      "Check redirect chains, multiple hops, status codes, redirect loops, and final destination URLs online.",
  },
};

export default function Page() {
  return <ToolClient />;
}
