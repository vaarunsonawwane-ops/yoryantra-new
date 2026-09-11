import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Hex Encoder Decoder | UTF-8 Text and Hex Bytes",
  description:
    "Encode UTF-8 text as hexadecimal bytes or decode common hex notation back to text with strict invalid-UTF-8 detection and byte-level guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/hex-encoder-decoder",
  },
  openGraph: {
    title: "Hex Encoder Decoder | Yoryantra",
    description:
      "Move between UTF-8 text and hexadecimal byte notation without silently replacing invalid UTF-8.",
    url: "https://yoryantra.com/tools/hex-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hex Encoder Decoder | Yoryantra",
    description:
      "Encode text to UTF-8 hex bytes and decode common hex forms back to valid UTF-8 text.",
  },
};

export default function HexEncoderDecoderPage() {
  return <ToolClient />;
}
