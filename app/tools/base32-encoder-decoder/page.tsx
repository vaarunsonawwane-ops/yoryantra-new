import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base32 Encoder Decoder | Encode and Decode Base32 Online | Yoryantra",
  description:
    "Encode text to Base32 and decode Base32 strings directly in your browser. Supports RFC 4648 Base32, padding options, uppercase output, whitespace cleanup, and byte-safe output.",
  keywords: [
    "Base32 Encoder Decoder",
    "Base32 encoder",
    "Base32 decoder",
    "Base32 converter",
    "RFC 4648 Base32",
    "decode Base32 online",
    "encode Base32 online",
    "TOTP secret decoder",
    "encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/base32-encoder-decoder",
  },
  openGraph: {
    title: "Base32 Encoder Decoder | Encode and Decode Base32 Online | Yoryantra",
    description:
      "Encode text to Base32 and decode Base32 strings directly in your browser. Supports RFC 4648 Base32, padding options, uppercase output, whitespace cleanup, and byte-safe output.",
    url: "https://yoryantra.com/tools/base32-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base32 Encoder Decoder | Encode and Decode Base32 Online | Yoryantra",
    description:
      "Encode text to Base32 and decode Base32 strings directly in your browser. Supports RFC 4648 Base32, padding options, uppercase output, whitespace cleanup, and byte-safe output.",
  },
};

export default function Base32EncoderDecoderPage() {
  return <ToolClient />;
}
