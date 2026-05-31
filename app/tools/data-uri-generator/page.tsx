import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Data URI Generator | Create Data URLs for Text, SVG, CSS, HTML | Yoryantra",
  description:
    "Generate data URIs from text, SVG, HTML, CSS, JSON, and small snippets. Choose MIME type, encoding style, Base64 output, and preview data URLs directly in your browser.",
  keywords: [
    "Data URI generator",
    "data URL generator",
    "data URI maker",
    "text to data URI",
    "SVG data URI generator",
    "CSS data URL generator",
    "HTML data URI generator",
    "Base64 data URI",
    "Encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/data-uri-generator",
  },
  openGraph: {
    title: "Data URI Generator | Create Data URLs for Text, SVG, CSS, HTML | Yoryantra",
    description:
      "Generate data URIs from text, SVG, HTML, CSS, JSON, and small snippets. Choose MIME type, encoding style, Base64 output, and preview data URLs directly in your browser.",
    url: "https://yoryantra.com/tools/data-uri-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data URI Generator | Create Data URLs for Text, SVG, CSS, HTML | Yoryantra",
    description:
      "Generate data URIs from text, SVG, HTML, CSS, JSON, and small snippets. Choose MIME type, encoding style, Base64 output, and preview data URLs directly in your browser.",
  },
};

export default function DataURIGeneratorPage() {
  return <ToolClient />;
}
