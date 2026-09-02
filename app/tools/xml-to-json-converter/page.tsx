import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML to JSON Converter | Compact & Ordered Mapping | Yoryantra",
  description:
    "Convert well-formed XML to compact JSON or an order-preserving node mapping with explicit handling for attributes, namespaces, text, CDATA, comments, and whitespace.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-to-json-converter",
  },
  openGraph: {
    title: "XML to JSON Converter | Compact & Ordered Mapping | Yoryantra",
    description:
      "Convert XML in your browser with transparent mapping rules for attributes, repeated elements, namespaces, mixed content, whitespace, and node order.",
    url: "https://yoryantra.com/tools/xml-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML to JSON Converter | Yoryantra",
    description:
      "Convert XML to compact or order-preserving JSON with documented mapping limitations.",
  },
};

export default function Page() {
  return <ToolClient />;
}
