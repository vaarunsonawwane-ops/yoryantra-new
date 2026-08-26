import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "MIME Encoded-Word Decoder – RFC 2047 Headers | Yoryantra",
  description:
    "Decode RFC 2047 MIME encoded-words in email subjects and display names. Inspect charset, Base64 B or Q encoding, folding, and malformed headers locally.",
  keywords: [
    "MIME decoder",
    "MIME encoded-word decoder",
    "RFC 2047 decoder",
    "decode MIME email subject",
    "email subject decoder",
    "MIME header decoder",
    "encoded word decoder",
    "UTF-8 email header decoder",
    "Base64 email header decoder",
    "Q encoding decoder",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/mime-encoded-word-decoder",
  },
  openGraph: {
    title: "MIME Encoded-Word Decoder – RFC 2047 Headers | Yoryantra",
    description:
      "Decode RFC 2047 MIME encoded-words in email subjects and display names. Inspect charset, Base64 B or Q encoding, folding, and malformed headers locally.",
    url: "https://yoryantra.com/tools/mime-encoded-word-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIME Encoded-Word Decoder – RFC 2047 Headers | Yoryantra",
    description:
      "Decode RFC 2047 MIME encoded-words in email subjects and display names. Inspect charset, Base64 B or Q encoding, folding, and malformed headers locally.",
  },
};

export default function MimeEncodedWordDecoderPage() {
  return <ToolClient />;
}
