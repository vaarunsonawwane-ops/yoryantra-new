import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "XML Escape Unescape | XML 1.0/1.1 Entities & Character Data",
  description:
    "Escape XML character data or decode predefined and numeric entities with XML 1.0/1.1 character, control-code, and undeclared-entity checks.",
  keywords: [
    "XML Escape Unescape",
    "XML escape tool",
    "XML unescape tool",
    "XML entity encoder",
    "XML entity decoder",
    "escape XML characters",
    "unescape XML entities",
    "SOAP XML escape",
    "RSS XML escape",
    "SVG XML escape",
    "encoding tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-escape-unescape",
  },
  openGraph: {
    title: "XML Escape Unescape | XML 1.0/1.1 Entities & Character Data",
    description:
      "Escape XML character data or decode predefined and numeric entities with XML 1.0/1.1 character, control-code, and undeclared-entity checks.",
    url: "https://yoryantra.com/tools/xml-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML Escape Unescape | XML 1.0/1.1 Entities & Character Data",
    description:
      "Escape XML character data or decode predefined and numeric entities with XML 1.0/1.1 character, control-code, and undeclared-entity checks.",
  },
};

export default function XmlEscapeUnescapePage() {
  return <ToolClient />;
}
