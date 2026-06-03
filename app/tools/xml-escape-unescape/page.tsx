import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "XML Escape Unescape | Convert XML Entities Safely | Yoryantra",
  description:
    "Escape and unescape XML entities for API payloads, RSS feeds, SOAP messages, SVG snippets, sitemaps, and configuration text locally in your browser.",
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
    title: "XML Escape Unescape | Convert XML Entities Safely | Yoryantra",
    description:
      "Escape and unescape XML entities for API payloads, RSS feeds, SOAP messages, SVG snippets, sitemaps, and configuration text locally in your browser.",
    url: "https://yoryantra.com/tools/xml-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML Escape Unescape | Convert XML Entities Safely | Yoryantra",
    description:
      "Escape and unescape XML entities for API payloads, RSS feeds, SOAP messages, SVG snippets, sitemaps, and configuration text locally in your browser.",
  },
};

export default function XmlEscapeUnescapePage() {
  return <ToolClient />;
}
