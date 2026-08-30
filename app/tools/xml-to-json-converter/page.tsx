import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML to JSON Converter | Mapping XML Structure | Yoryantra",
  description:
    "Convert XML to JSON with explicit compact or ordered mappings for attributes, repeated elements, namespaces, CDATA, and mixed-content workflows.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-to-json-converter",
  },
  openGraph: {
    title: "XML to JSON Converter | Mapping XML Structure | Yoryantra",
    description:
      "Convert well-formed XML using compact or ordered JSON mappings that make attributes, repeated elements, and mixed content explicit.",
    url: "https://yoryantra.com/tools/xml-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML to JSON Converter | Mapping XML Structure | Yoryantra",
    description:
      "Convert XML with explicit compact or ordered mappings for attributes and mixed content.",
  },
};

export default function Page() {
  return <ToolClient />;
}
