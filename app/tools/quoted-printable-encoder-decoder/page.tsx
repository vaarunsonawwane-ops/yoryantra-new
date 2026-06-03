import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Quoted Printable Encoder Decoder | Encode Decode MIME Text Online | Yoryantra",
  description:
    "Encode and decode Quoted-Printable text for email and MIME debugging. Handle soft line breaks, UTF-8 text, equals escapes, line wrapping, spaces, tabs, and clean report output.",
  keywords: [
    "Quoted Printable Encoder Decoder",
    "quoted printable decoder",
    "quoted printable encoder",
    "MIME quoted printable",
    "email encoding decoder",
    "decode quoted printable online",
    "encode quoted printable online",
    "email MIME tools",
    "encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/quoted-printable-encoder-decoder",
  },
  openGraph: {
    title: "Quoted Printable Encoder Decoder | Encode Decode MIME Text Online | Yoryantra",
    description:
      "Encode and decode Quoted-Printable text for email and MIME debugging. Handle soft line breaks, UTF-8 text, equals escapes, line wrapping, spaces, tabs, and clean report output.",
    url: "https://yoryantra.com/tools/quoted-printable-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quoted Printable Encoder Decoder | Encode Decode MIME Text Online | Yoryantra",
    description:
      "Encode and decode Quoted-Printable text for email and MIME debugging. Handle soft line breaks, UTF-8 text, equals escapes, line wrapping, spaces, tabs, and clean report output.",
  },
};

export default function QuotedPrintableEncoderDecoderPage() {
  return <ToolClient />;
}
