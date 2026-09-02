import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "XML Formatter & Well-Formedness Check | Yoryantra",
  description:
    "Format XML with 2- or 4-space indentation and check well-formedness in your browser. Understand mixed content, xml:space, namespaces, parser errors, and limits.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-formatter",
  },
  openGraph: {
    title: "XML Formatter & Well-Formedness Check | Yoryantra",
    description:
      "Pretty-print element-oriented XML while respecting mixed-content and xml:space boundaries, with practical XML parser guidance.",
    url: "https://yoryantra.com/tools/xml-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML Formatter | Yoryantra",
    description: "Format XML, check well-formedness, and understand whitespace-sensitive XML limitations.",
  },
};

export default function Page() {
  return <ToolClient />;
}
