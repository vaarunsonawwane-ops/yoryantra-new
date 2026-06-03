import ToolClient from "./ToolClient";

export const metadata = {
  title: "Redirect Checker Online Free | Yoryantra",

  description:
    "Check URL redirects and HTTP redirect status instantly with this free online Redirect Checker.",

  keywords: [
    "redirect checker",
    "url redirect checker",
    "301 redirect checker",
    "302 redirect checker",
    "http redirect checker",
    "seo redirect tool",
    "technical seo tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/redirect-checker",
  },

  openGraph: {
    title:
      "Redirect Checker Online Free | Yoryantra",

    description:
      "Check URL redirects and HTTP redirect status instantly online.",

    url:
      "https://yoryantra.com/tools/redirect-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Redirect Checker Online Free | Yoryantra",

    description:
      "Check URL redirects instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}