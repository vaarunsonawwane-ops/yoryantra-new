import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Binary Encoder Decoder – UTF-8 Text & Binary | Yoryantra",
  description:
    "Convert UTF-8 text to 8-bit binary bytes and decode grouped or continuous binary back to text, with invalid byte and UTF-8 checks in your browser.",
  alternates: {
    canonical: "https://yoryantra.com/tools/binary-encoder-decoder",
  },
  openGraph: {
    title: "Binary Encoder Decoder – UTF-8 Text & Binary | Yoryantra",
    description:
      "Convert UTF-8 text to binary bytes and decode grouped, prefixed, or continuous binary back to text with strict UTF-8 validation.",
    url: "https://yoryantra.com/tools/binary-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Binary Encoder Decoder – UTF-8 Text & Binary | Yoryantra",
    description:
      "Convert UTF-8 text to 8-bit binary bytes and decode binary bytes back to text with validation.",
  },
};

export default function Page() {
  return <ToolClient />;
}
