import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "MIME Decoder – Decode RFC 2047 Email Headers | Yoryantra",
  description:
    "Decode MIME and RFC 2047 email headers, subject lines, and sender names. Read UTF-8 Base64 or Q encoded words locally in your browser.",
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
    title: "MIME Decoder – Decode RFC 2047 Email Headers | Yoryantra",
    description:
      "Decode MIME and RFC 2047 email headers, subject lines, and sender names. Read UTF-8 Base64 or Q encoded words locally in your browser.",
    url: "https://yoryantra.com/tools/mime-encoded-word-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIME Decoder – Decode RFC 2047 Email Headers | Yoryantra",
    description:
      "Decode MIME and RFC 2047 email headers, subject lines, and sender names. Read UTF-8 Base64 or Q encoded words locally in your browser.",
  },
};

export default function MimeEncodedWordDecoderPage() {
  return <ToolClient />;
}
