import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Canonical URL Checker | HTML & Link Header Review | Yoryantra",
  description:
    "Inspect canonical declarations from URLs, HTML link elements or HTTP Link headers and compare scheme, host, path, query, fragments and conflicting signals.",
  alternates: {
    canonical: "https://yoryantra.com/tools/canonical-url-checker",
  },
  openGraph: {
    title: "Canonical URL Checker | Yoryantra",
    description:
      "Compare a page URL with its canonical declaration and review structural conflicts without pretending to know the search engine selected canonical.",
    url: "https://yoryantra.com/tools/canonical-url-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Canonical URL Checker | Yoryantra",
    description:
      "Inspect canonical URLs, HTML link elements and HTTP Link headers for structural conflicts and common implementation mistakes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
