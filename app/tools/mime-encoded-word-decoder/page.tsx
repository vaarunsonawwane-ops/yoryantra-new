import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "MIME Encoded-Word Decoder | Decode Email Subject Headers | Yoryantra",
  description:
    "Decode MIME encoded-word email headers such as =?UTF-8?B?...?= and =?UTF-8?Q?...?=. Inspect charset, encoding method, header folding, and decoded subject text locally.",
  keywords: [
    "MIME Encoded-Word Decoder",
    "RFC 2047 decoder",
    "email subject decoder",
    "MIME header decoder",
    "encoded word decoder",
    "UTF-8 email header decoder",
    "quoted printable header decoder",
    "Base64 email header decoder",
    "email header tools",
    "encoding tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/mime-encoded-word-decoder",
  },
  openGraph: {
    title: "MIME Encoded-Word Decoder | Decode Email Subject Headers | Yoryantra",
    description:
      "Decode MIME encoded-word email headers such as =?UTF-8?B?...?= and =?UTF-8?Q?...?=. Inspect charset, encoding method, header folding, and decoded subject text locally.",
    url: "https://yoryantra.com/tools/mime-encoded-word-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIME Encoded-Word Decoder | Decode Email Subject Headers | Yoryantra",
    description:
      "Decode MIME encoded-word email headers such as =?UTF-8?B?...?= and =?UTF-8?Q?...?=. Inspect charset, encoding method, header folding, and decoded subject text locally.",
  },
};

export default function MimeEncodedWordDecoderPage() {
  return <ToolClient />;
}
