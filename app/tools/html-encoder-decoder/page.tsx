import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTML Encoder Decoder | Character References | Yoryantra",
  description:
    "Encode text as named, decimal, or hexadecimal HTML character references and decode browser-recognized references with context, Unicode, and sanitization guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/html-encoder-decoder",
  },
  openGraph: {
    title: "HTML Encoder Decoder | Character References | Yoryantra",
    description:
      "Convert text to HTML character references or decode named and numeric references while keeping entity conversion separate from sanitization.",
    url: "https://yoryantra.com/tools/html-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Encoder Decoder | Yoryantra",
    description:
      "Encode or decode named, decimal, and hexadecimal HTML character references in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
