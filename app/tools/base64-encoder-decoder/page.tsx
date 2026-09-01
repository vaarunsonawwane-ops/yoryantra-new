import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base64 Encoder Decoder | UTF-8, Bytes & Validation | Yoryantra",
  description:
    "Encode UTF-8 text as standard Base64 or decode Base64 into text or hex bytes with canonical validation, relaxed padding handling, and Base64URL diagnostics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/base64-encoder-decoder",
  },
  openGraph: {
    title: "Base64 Encoder Decoder | Yoryantra",
    description:
      "Encode Unicode text and inspect decoded Base64 bytes with padding, alphabet, UTF-8, and canonical-form diagnostics.",
    url: "https://yoryantra.com/tools/base64-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Base64 Encoder Decoder | Yoryantra",
    description:
      "Work with standard RFC 4648 Base64 and UTF-8 text directly in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
