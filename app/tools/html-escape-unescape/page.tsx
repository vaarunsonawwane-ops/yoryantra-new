import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTML Escape Unescape | Yoryantra",
  description:
    "Escape HTML special characters or decode HTML character references locally in your browser, with context-specific security guidance and standards references.",
  alternates: {
    canonical: "https://yoryantra.com/tools/html-escape-unescape",
  },
  openGraph: {
    title: "HTML Escape Unescape | Yoryantra",
    description:
      "Escape HTML special characters, decode named or numeric character references, and review the output context before using the result.",
    url: "https://yoryantra.com/tools/html-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Escape Unescape | Yoryantra",
    description:
      "Encode HTML special characters and decode HTML character references locally in your browser.",
  },
};

export default function HtmlEscapeUnescapePage() {
  return <ToolClient />;
}
