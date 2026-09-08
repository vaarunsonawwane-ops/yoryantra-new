import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HMAC Generator — SHA-256, SHA-384 and SHA-512 | Yoryantra",
  description:
    "Compute HMAC values from exact UTF-8 messages with UTF-8, hex, or Base64 keys and output the MAC as hex, Base64, or Base64URL.",
  keywords: [
    "hmac generator",
    "hmac sha256",
    "hmac sha384",
    "hmac sha512",
    "webhook hmac",
    "api hmac",
    "base64 hmac",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/hmac-generator",
  },
  openGraph: {
    title: "HMAC Generator — SHA-256, SHA-384 and SHA-512 | Yoryantra",
    description:
      "Compute HMACs with explicit key and output encodings while preserving the exact UTF-8 message bytes.",
    url: "https://yoryantra.com/tools/hmac-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HMAC Generator — SHA-256, SHA-384 and SHA-512 | Yoryantra",
    description:
      "Calculate SHA-2 HMAC values with selectable key decoding and hex, Base64, or Base64URL output.",
  },
};

export default function Page() {
  return <ToolClient />;
}
