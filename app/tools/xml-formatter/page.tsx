import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "XML Formatter | Pretty Print Well-Formed XML | Yoryantra",
  description:
    "Pretty print well-formed XML with conservative handling for mixed content, CDATA, comments, namespaces, DOCTYPE declarations, and xml:space-sensitive text.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-formatter",
  },
  openGraph: {
    title: "XML Formatter | Pretty Print XML | Yoryantra",
    description:
      "Format well-formed XML while avoiding added indentation inside mixed-content and whitespace-sensitive elements.",
    url: "https://yoryantra.com/tools/xml-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "XML Formatter | Yoryantra",
    description:
      "Pretty print well-formed XML with conservative mixed-content and xml:space handling.",
  },
};

export default function Page() {
  return <ToolClient />;
}
