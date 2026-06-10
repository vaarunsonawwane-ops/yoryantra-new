import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTML Escape Unescape Online | Encode and Decode HTML Entities",
  description:
    "Escape HTML online, unescape HTML entities, encode special characters, decode entity-encoded text, and safely convert HTML snippets for frontend and content workflows.",
  keywords: [
    "html escape unescape",
    "html escape online",
    "html unescape online",
    "html entity encoder",
    "html entity decoder",
    "escape html",
    "unescape html",
    "encode html entities",
    "decode html entities",
    "html entities converter",
    "html encoder decoder",
    "html escape tool",
    "html decode online",
    "encoding tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/html-escape-unescape",
  },
  openGraph: {
    title: "HTML Escape Unescape Online | Yoryantra",
    description:
      "Escape HTML, unescape HTML entities, and convert special characters directly in your browser.",
    url: "https://yoryantra.com/tools/html-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Escape Unescape Online | Yoryantra",
    description:
      "Encode and decode HTML entities for safe text display, frontend debugging, APIs, and content work.",
  },
};

export default function HtmlEscapeUnescapePage() {
  return <ToolClient />;
}
