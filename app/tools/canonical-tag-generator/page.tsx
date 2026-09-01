import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Canonical Tag Generator | HTML, HTTP & Next.js | Yoryantra",
  description:
    "Generate HTML, HTTP Link or Next.js canonicals while checking fragments, credentials, tracking parameters, URL normalization and page-to-canonical differences.",
  alternates: {
    canonical: "https://yoryantra.com/tools/canonical-tag-generator",
  },
  openGraph: {
    title: "Canonical Tag Generator | Yoryantra",
    description:
      "Generate escaped canonical output and review the relationship between the current page URL and its preferred canonical without treating canonicalization as a redirect.",
    url: "https://yoryantra.com/tools/canonical-tag-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Canonical Tag Generator | Yoryantra",
    description:
      "Create HTML, HTTP Link or Next.js canonical output with practical canonical-signal and URL-cleanup guidance.",
  },
};

export default function Page() {
  return <ToolClient />;
}
