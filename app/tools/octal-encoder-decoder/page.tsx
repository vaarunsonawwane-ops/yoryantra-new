import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Octal Encoder Decoder | Convert Text, Bytes, and Octal Values",
  description:
    "Convert text to octal, decode octal values back to readable text, inspect byte values, and format octal output locally in your browser.",
  keywords: [
    "octal encoder decoder",
    "text to octal converter",
    "octal to text converter",
    "octal decoder",
    "octal encoder",
    "ascii to octal",
    "unicode to octal",
    "byte to octal converter",
    "encoding tools",
    "browser octal converter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/octal-encoder-decoder",
  },
  openGraph: {
    title: "Octal Encoder Decoder | Yoryantra",
    description:
      "Encode text into octal values, decode octal back to readable text, and inspect byte-level output locally in your browser.",
    url: "https://yoryantra.com/tools/octal-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Octal Encoder Decoder | Yoryantra",
    description:
      "Convert between text, UTF-8 bytes, and octal values with local browser-side processing.",
  },
};

export default function OctalEncoderDecoderPage() {
  return <ToolClient />;
}
