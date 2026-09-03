import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML to JSON Converter | Compact or Ordered JSON | Yoryantra",
  description:
    "Convert well-formed XML to compact JSON or an ordered node model with explicit handling for attributes, namespaces, mixed content, whitespace, and CDATA.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-to-json-converter",
  },
  openGraph: {
    title: "XML to JSON Converter | Compact or Ordered JSON | Yoryantra",
    description:
      "Convert XML to compact JSON or an ordered node model while keeping attributes, repeated elements, namespaces, mixed content, whitespace, and node order explicit.",
    url: "https://yoryantra.com/tools/xml-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML to JSON Converter | Yoryantra",
    description:
      "Convert well-formed XML to compact or order-preserving JSON with explicit mapping choices for XML features that JSON does not model directly.",
  },
};

export default function Page() {
  return <ToolClient />;
}
