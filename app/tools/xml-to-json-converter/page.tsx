import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "XML to JSON Converter | Compact & Ordered Mapping | Yoryantra",
  description:
    "Convert well-formed XML to explicit compact or ordered JSON mappings with attributes, namespaces, repeated elements, CDATA, mixed content, and whitespace caveats.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-to-json-converter",
  },
  openGraph: {
    title: "XML to JSON Converter | Mapping XML Structure | Yoryantra",
    description:
      "Convert XML using compact or ordered JSON mappings that make attributes, namespaces, repeated elements, mixed content, and conversion loss visible.",
    url: "https://yoryantra.com/tools/xml-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "XML to JSON Converter | Yoryantra",
    description:
      "Convert well-formed XML with compact or ordered JSON mappings and explicit namespace and mixed-content handling.",
  },
};

export default function Page() {
  return <ToolClient />;
}
