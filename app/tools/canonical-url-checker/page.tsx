import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Canonical URL Checker | HTML & Link Header Review | Yoryantra",
  description:
    "Compare a page URL with canonical declarations from a URL, HTML link element or HTTP Link header and review fragments, tracking parameters, host, path and query differences.",
  alternates: {
    canonical: "https://yoryantra.com/tools/canonical-url-checker",
  },
  openGraph: {
    title: "Canonical URL Checker | Yoryantra",
    description:
      "Review canonical URL declarations structurally without pretending to fetch the page or know a search engine's selected canonical.",
    url: "https://yoryantra.com/tools/canonical-url-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Canonical URL Checker | Yoryantra",
    description:
      "Compare page and canonical URLs, inspect HTML/HTTP declarations, and surface conflicting structural signals locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
