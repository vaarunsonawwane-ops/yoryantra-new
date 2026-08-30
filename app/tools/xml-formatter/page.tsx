import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML Formatter | Pretty Print Well-Formed XML | Yoryantra",
  description:
    "Pretty print well-formed XML with conservative handling for mixed text, CDATA, comments, namespaces, processing instructions, and xml:space-sensitive content.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-formatter",
  },
  openGraph: {
    title: "XML Formatter | Pretty Print XML | Yoryantra",
    description:
      "Pretty print well-formed XML while preserving mixed-content and xml:space-sensitive elements from added indentation.",
    url: "https://yoryantra.com/tools/xml-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML Formatter | Yoryantra",
    description:
      "Format well-formed XML with conservative mixed-content and whitespace handling.",
  },
};

export default function Page() {
  return <ToolClient />;
}
