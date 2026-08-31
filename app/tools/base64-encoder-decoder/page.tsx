import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base64 Encoder Decoder | UTF-8 & Bytes | Yoryantra",
  description:
    "Encode UTF-8 text to Base64 or decode Base64 into UTF-8 text and byte hex with strict RFC 4648 validation options.",
  alternates: {
    canonical: "https://yoryantra.com/tools/base64-encoder-decoder",
  },
  openGraph: {
    title: "Base64 Encoder Decoder | Yoryantra",
    description:
      "Encode Unicode text to Base64 and decode Base64 with padding, alphabet, UTF-8, and byte-level diagnostics.",
    url: "https://yoryantra.com/tools/base64-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Base64 Encoder Decoder | Yoryantra",
    description:
      "Work with RFC 4648 Base64 and UTF-8 text directly in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
