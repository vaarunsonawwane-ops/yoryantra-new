import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "ROT13 Encoder Decoder | ASCII Letter Rotation",
  description:
    "Apply ROT13 to ASCII A–Z and a–z while preserving digits, punctuation, and non-ASCII text, with reversible-mapping and security-boundary guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/rot13-encoder-decoder",
  },
  openGraph: {
    title: "ROT13 Encoder Decoder | Yoryantra",
    description:
      "Rotate ASCII letters by 13 positions while preserving numbers, punctuation, accents, and other Unicode text.",
    url: "https://yoryantra.com/tools/rot13-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ROT13 Encoder Decoder | Yoryantra",
    description:
      "Apply the reversible ROT13 letter mapping without treating it as encryption.",
  },
};

export default function Rot13EncoderDecoderPage() {
  return <ToolClient />;
}
