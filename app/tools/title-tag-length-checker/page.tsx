import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Title Tag Length Checker | Bulk SEO Title Audit | Yoryantra",
  description:
    "Review title tags for character and word length, duplicates, vague wording, repeated branding, target phrases and shared boilerplate without pretending Google has a fixed title limit.",
  alternates: {
    canonical: "https://yoryantra.com/tools/title-tag-length-checker",
  },
  openGraph: {
    title: "Title Tag Length Checker | Yoryantra",
    description:
      "Audit individual or bulk title tags for length, duplication, boilerplate and page differentiation using an editable review threshold rather than a fake Google limit.",
    url: "https://yoryantra.com/tools/title-tag-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Title Tag Length Checker | Yoryantra",
    description:
      "Check title-tag length and bulk title quality while keeping Google's title-link rewriting and lack of a fixed character limit explicit.",
  },
};

export default function Page() {
  return <ToolClient />;
}
