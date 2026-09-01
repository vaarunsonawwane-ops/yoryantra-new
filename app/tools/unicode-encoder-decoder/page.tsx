import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Unicode Encoder Decoder | Escapes & Code Points | Yoryantra",
  description:
    "Convert Unicode text to UTF-16 \\uXXXX escapes, JavaScript escapes, or U+ notation; decode with surrogate checks and inspect code points, UTF-16, and UTF-8.",
  alternates: {
    canonical: "https://yoryantra.com/tools/unicode-encoder-decoder",
  },
  openGraph: {
    title: "Unicode Encoder Decoder | Yoryantra",
    description:
      "Inspect the difference between Unicode code points, UTF-16 code units, JavaScript escapes, JSON-style escapes, and UTF-8 byte length.",
    url: "https://yoryantra.com/tools/unicode-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Unicode Encoder Decoder | Yoryantra",
    description:
      "Encode, decode, and inspect Unicode code points, UTF-16 escapes, JavaScript escapes, and UTF-8 bytes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
