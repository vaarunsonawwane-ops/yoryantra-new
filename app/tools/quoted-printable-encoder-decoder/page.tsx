import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Quoted-Printable Encoder Decoder | RFC 2045 MIME Text | Yoryantra",
  description:
    "Encode MIME body text with RFC 2045 Quoted-Printable rules or decode escapes, soft breaks, transport whitespace, and UTF-8 bytes.",
  keywords: [
    "Quoted-Printable encoder decoder",
    "RFC 2045 Quoted-Printable",
    "MIME transfer encoding",
    "quoted printable soft line break",
    "decode MIME body",
    "quoted printable UTF-8",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/quoted-printable-encoder-decoder",
  },
  openGraph: {
    title: "Quoted-Printable Encoder Decoder | RFC 2045 MIME Text | Yoryantra",
    description:
      "Encode or decode MIME body text with RFC 2045 line, escape, whitespace, and charset boundaries made explicit.",
    url: "https://yoryantra.com/tools/quoted-printable-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quoted-Printable Encoder Decoder | RFC 2045 MIME Text | Yoryantra",
    description:
      "Encode or decode MIME body text with RFC 2045 line, escape, whitespace, and charset boundaries made explicit.",
  },
};

export default function QuotedPrintableEncoderDecoderPage() {
  return <ToolClient />;
}
