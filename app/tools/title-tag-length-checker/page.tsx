import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Title Tag Length Checker | Duplicates & Boilerplate | Yoryantra",
  description:
    "Review title elements for character and word length, duplicates, vague wording, repeated branding and shared boilerplate without treating an editing threshold as a Google limit.",
  alternates: {
    canonical: "https://yoryantra.com/tools/title-tag-length-checker",
  },
  openGraph: {
    title: "Title Tag Length Checker | Yoryantra",
    description:
      "Review individual or bulk title elements for length, duplicates, boilerplate and page differentiation with an editable threshold that is not presented as a Google limit.",
    url: "https://yoryantra.com/tools/title-tag-length-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Title Tag Length Checker | Yoryantra",
    description:
      "Review title length, duplicates and shared wording while keeping Google's automated title-link generation and lack of a fixed character limit explicit.",
  },
};

export default function Page() {
  return <ToolClient />;
}
