import ToolClient from "./ToolClient";

export const metadata = {
  title: "Canonical URL Checker Online Free | Yoryantra",

  description:
    "Check and validate canonical URLs instantly with this free online Canonical URL Checker.",

  keywords: [
    "canonical url checker",
    "canonical tag checker",
    "canonical url validator",
    "seo canonical checker",
    "check canonical url",
    "technical seo tools",
    "canonical tag validator",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/canonical-url-checker",
  },

  openGraph: {
    title:
      "Canonical URL Checker Online Free | Yoryantra",

    description:
      "Check and validate canonical URLs instantly online.",

    url:
      "https://yoryantra.com/tools/canonical-url-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Canonical URL Checker Online Free | Yoryantra",

    description:
      "Validate canonical URLs instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}