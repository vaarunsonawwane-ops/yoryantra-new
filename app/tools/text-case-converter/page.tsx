import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Text Case Converter | Upper, Lower, Title and Sentence Case",
  description:
    "Convert text to uppercase, lowercase, simple title case, or sentence case while preserving punctuation and line breaks and using Unicode-aware case mappings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/text-case-converter",
  },
  openGraph: {
    title: "Text Case Converter | Yoryantra",
    description:
      "Change text between uppercase, lowercase, simple title case, and sentence case with Unicode-aware casing.",
    url: "https://yoryantra.com/tools/text-case-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Text Case Converter | Yoryantra",
    description:
      "Transform capitalization while preserving the text structure and understanding the limits of automatic casing.",
  },
};

export default function TextCaseConverterPage() {
  return <ToolClient />;
}
