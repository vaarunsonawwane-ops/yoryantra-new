import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTML Escape Unescape | Encode & Decode HTML Entities",
  description:
    "Escape HTML special characters or decode HTML character references in your browser. Compare named and numeric output and review safe output contexts.",
  alternates: {
    canonical: "https://yoryantra.com/tools/html-escape-unescape",
  },
  openGraph: {
    title: "HTML Escape Unescape | Yoryantra",
    description:
      "Escape HTML special characters, decode character references, and review the output context before using it in a page.",
    url: "https://yoryantra.com/tools/html-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Escape Unescape | Yoryantra",
    description:
      "Encode HTML special characters and decode named or numeric character references locally in your browser.",
  },
};

export default function HtmlEscapeUnescapePage() {
  return <ToolClient />;
}
