import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Sitemap Validator | XML, Scope & URL Limits | Yoryantra",
  description:
    "Validate sitemap XML or indexes for namespace, loc URLs, lastmod, duplicates, deployment scope, entry limits and UTF-8 file size.",
  alternates: {
    canonical: "https://yoryantra.com/tools/sitemap-validator",
  },
  openGraph: {
    title: "Sitemap Validator | Yoryantra",
    description:
      "Inspect sitemap XML structure, protocol namespace, URL/index entries, lastmod values, scope, duplicates and protocol limits without claiming search indexability.",
    url: "https://yoryantra.com/tools/sitemap-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sitemap Validator | Yoryantra",
    description:
      "Validate sitemap XML, namespace, loc URLs, lastmod, deployment scope, entry counts and file-size limits locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
