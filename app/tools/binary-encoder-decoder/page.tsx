import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Binary Encoder Decoder | UTF-8 Text & Bytes | Yoryantra",
  description:
    "Encode Unicode text as UTF-8 binary bytes, decode strict UTF-8 from 8-bit binary, or inspect arbitrary byte values without silently replacing malformed text sequences.",
  alternates: {
    canonical: "https://yoryantra.com/tools/binary-encoder-decoder",
  },
  openGraph: {
    title: "Binary Encoder Decoder | Yoryantra",
    description:
      "Convert text and binary bytes with strict UTF-8 validation, byte inspection, multiple binary layouts and exact malformed-sequence diagnostics.",
    url: "https://yoryantra.com/tools/binary-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Binary Encoder Decoder | Yoryantra",
    description:
      "Encode text to UTF-8 binary, decode complete 8-bit bytes strictly, or inspect binary that is not text.",
  },
};

export default function Page() {
  return <ToolClient />;
}
