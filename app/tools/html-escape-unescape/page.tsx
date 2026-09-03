import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTML Escape & Unescape | Encode Character References",
  description:
    "Escape HTML-sensitive characters or decode HTML character references. Compare named and numeric forms, spot double encoding, and understand context-specific limits.",
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
    title: "HTML Escape & Unescape | Yoryantra",
    description:
      "Escape HTML-sensitive characters or decode character references, with clear notes on double encoding, sanitization, and output context.",
    url: "https://yoryantra.com/tools/html-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Escape & Unescape | Yoryantra",
    description:
      "Escape HTML-sensitive characters or decode HTML character references with context and double-encoding guidance.",
  },
};

export default function HtmlEscapeUnescapePage() {
  return <ToolClient />;
}
