import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTML Escape & Unescape Tool | Encode and Decode Entities",
  description:
    "Escape or unescape HTML character references in your browser. Compare named and numeric entities, avoid double encoding, and understand context and security limits.",
  keywords: [
    "html escape unescape",
    "html entity encoder decoder",
    "escape html",
    "unescape html",
    "html character references",
    "encode html entities",
    "decode html entities",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/html-escape-unescape",
  },
  openGraph: {
    title: "HTML Escape & Unescape Tool | Yoryantra",
    description:
      "Encode HTML-sensitive characters or decode HTML character references with practical guidance about contexts, double encoding, and sanitization.",
    url: "https://yoryantra.com/tools/html-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Escape & Unescape Tool | Yoryantra",
    description:
      "Escape HTML-sensitive characters or decode HTML character references directly in your browser.",
  },
};

export default function HtmlEscapeUnescapePage() {
  return <ToolClient />;
}
