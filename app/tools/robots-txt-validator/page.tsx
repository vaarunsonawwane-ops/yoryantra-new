import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Robots.txt Validator | RFC 9309 Rule Review | Yoryantra",
  description:
    "Validate robots.txt groups, product tokens, Allow/Disallow patterns, merged groups, percent escapes, Sitemap records and deployment location.",
  alternates: {
    canonical: "https://yoryantra.com/tools/robots-txt-validator",
  },
  openGraph: {
    title: "Robots.txt Validator | Yoryantra",
    description:
      "Review robots.txt against RFC 9309 structure and matching rules while separating standard crawler controls from Sitemap and crawler-specific extensions.",
    url: "https://yoryantra.com/tools/robots-txt-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Robots.txt Validator | Yoryantra",
    description:
      "Inspect robots.txt groups, Allow/Disallow patterns, merged user-agent groups, Sitemap records and crawler-specific extensions.",
  },
};

export default function Page() {
  return <ToolClient />;
}
