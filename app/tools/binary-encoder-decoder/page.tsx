import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Binary Encoder Decoder | UTF-8 Text & Bytes | Yoryantra",
  description:
    "Encode Unicode text as UTF-8 binary bytes, strictly decode complete 8-bit binary as UTF-8, or inspect arbitrary bytes without replacement-character repair or hidden normalization.",
  alternates: {
    canonical: "https://yoryantra.com/tools/binary-encoder-decoder",
  },
  openGraph: {
    title: "Binary Encoder Decoder | Yoryantra",
    description:
      "Encode Unicode text as UTF-8 bytes, decode valid UTF-8 strictly, and inspect byte values when the binary data is not necessarily text.",
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
