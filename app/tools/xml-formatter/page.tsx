import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "XML Formatter — Well-Formedness & xml:space | Yoryantra",
  description:
    "Format XML with 2- or 4-space indentation and check well-formedness while accounting for mixed content, xml:space, DTDs, and DOM serialization limits.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-formatter",
  },
  openGraph: {
    title: "XML Formatter — Well-Formedness & xml:space | Yoryantra",
    description:
      "Indent XML without blindly changing mixed-content whitespace, and understand what browser parsing and serialization can normalize.",
    url: "https://yoryantra.com/tools/xml-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML Formatter | Yoryantra",
    description:
      "Check XML well-formedness and format structural XML while respecting mixed content and whitespace-sensitive boundaries.",
  },
};

export default function Page() {
  return <ToolClient />;
}
