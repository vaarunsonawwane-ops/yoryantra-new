import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "MIME Encoded-Word Decoder | RFC 2047 Email Headers | Yoryantra",
  description:
    "Decode and inspect RFC 2047 encoded-words in email headers, including B/Q encoding, charsets, adjacent words, folding, malformed syntax and 75-character limits.",
  alternates: {
    canonical: "https://yoryantra.com/tools/mime-encoded-word-decoder",
  },
  openGraph: {
    title: "MIME Encoded-Word Decoder | Yoryantra",
    description:
      "Decode RFC 2047 email subjects and display names, inspect each encoded-word, and distinguish malformed B/Q or charset data from valid header text.",
    url: "https://yoryantra.com/tools/mime-encoded-word-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MIME Encoded-Word Decoder | Yoryantra",
    description:
      "Decode RFC 2047 B/Q encoded-words, inspect charsets and folding, and surface malformed email-header encoding locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
