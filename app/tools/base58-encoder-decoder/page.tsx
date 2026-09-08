import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base58 Encoder Decoder | Bitcoin & Flickr Alphabets | Yoryantra",
  description:
    "Encode UTF-8 or hex bytes with Bitcoin or Flickr Base58, decode values back to bytes, and preserve leading-zero semantics.",
  keywords: [
    "Base58 encoder decoder",
    "Bitcoin Base58",
    "Flickr Base58",
    "Base58 leading zero bytes",
    "raw Base58",
    "Base58Check difference",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/base58-encoder-decoder",
  },
  openGraph: {
    title: "Base58 Encoder Decoder | Bitcoin & Flickr Alphabets | Yoryantra",
    description:
      "Encode and decode raw Base58 bytes with explicit alphabet and leading-zero handling.",
    url: "https://yoryantra.com/tools/base58-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base58 Encoder Decoder | Bitcoin & Flickr Alphabets | Yoryantra",
    description:
      "Encode and decode raw Base58 bytes with explicit alphabet and leading-zero handling.",
  },
};

export default function Base58EncoderDecoderPage() {
  return <ToolClient />;
}
