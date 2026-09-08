import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base32 Encoder Decoder | RFC 4648 Base32 & Base32hex | Yoryantra",
  description:
    "Encode UTF-8 or hex bytes with RFC 4648 Base32 and Base32hex, or validate and decode padded and unpadded values.",
  keywords: [
    "Base32 encoder decoder",
    "RFC 4648 Base32",
    "Base32hex",
    "Base32 padding",
    "Base32 decode bytes",
    "TOTP Base32",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/base32-encoder-decoder",
  },
  openGraph: {
    title: "Base32 Encoder Decoder | RFC 4648 Base32 & Base32hex | Yoryantra",
    description:
      "Encode bytes with RFC 4648 Base32 or validate and decode padded and unpadded Base32 values.",
    url: "https://yoryantra.com/tools/base32-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base32 Encoder Decoder | RFC 4648 Base32 & Base32hex | Yoryantra",
    description:
      "Encode bytes with RFC 4648 Base32 or validate and decode padded and unpadded Base32 values.",
  },
};

export default function Base32EncoderDecoderPage() {
  return <ToolClient />;
}
