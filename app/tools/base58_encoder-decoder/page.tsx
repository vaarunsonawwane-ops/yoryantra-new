import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base58 Encoder Decoder | Encode and Decode Base58 Online | Yoryantra",
  description:
    "Encode text or hex bytes to Base58 and decode Base58 strings directly in your browser. Supports Bitcoin Base58, Flickr Base58, byte-safe output, grouped output, and clean developer reports.",
  keywords: [
    "Base58 Encoder Decoder",
    "Base58 encoder",
    "Base58 decoder",
    "Base58 converter",
    "Bitcoin Base58",
    "Flickr Base58",
    "decode Base58 online",
    "encode Base58 online",
    "encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/base58-encoder-decoder",
  },
  openGraph: {
    title: "Base58 Encoder Decoder | Encode and Decode Base58 Online | Yoryantra",
    description:
      "Encode text or hex bytes to Base58 and decode Base58 strings directly in your browser. Supports Bitcoin Base58, Flickr Base58, byte-safe output, grouped output, and clean developer reports.",
    url: "https://yoryantra.com/tools/base58-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base58 Encoder Decoder | Encode and Decode Base58 Online | Yoryantra",
    description:
      "Encode text or hex bytes to Base58 and decode Base58 strings directly in your browser. Supports Bitcoin Base58, Flickr Base58, byte-safe output, grouped output, and clean developer reports.",
  },
};

export default function Base58EncoderDecoderPage() {
  return <ToolClient />;
}
