import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Data URI Generator Online | Create Data URLs for SVG, Text, HTML, CSS",
  description:
    "Generate data URIs online from SVG, text, HTML, CSS, and JSON. Choose MIME type, percent encoding or Base64, preview supported data URLs, and copy clean output.",
  keywords: [
    "data uri generator",
    "data url generator",
    "data uri maker",
    "data url maker",
    "svg data uri generator",
    "text to data uri",
    "html data uri generator",
    "css data url generator",
    "base64 data uri",
    "data uri base64 generator",
    "image svg xml data uri",
    "create data url online",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/data-uri-generator",
  },
  openGraph: {
    title: "Data URI Generator Online | Yoryantra",
    description:
      "Create data URLs from SVG, text, HTML, CSS, and JSON with MIME type, charset, percent encoding, Base64 output, and preview support.",
    url: "https://yoryantra.com/tools/data-uri-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Data URI Generator Online | Yoryantra",
    description:
      "Generate data URIs for SVG, text, HTML, CSS, and JSON directly in your browser.",
  },
};

export default function DataURIGeneratorPage() {
  return <ToolClient />;
}
