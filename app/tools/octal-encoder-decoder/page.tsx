import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Octal Encoder Decoder | Text, UTF-8 Bytes & Octal",
  description:
    "Convert text to octal bytes or decode supplied octal groups with explicit ASCII, UTF-8, malformed-token, and ambiguous-boundary checks.",
  keywords: [
    "octal encoder decoder",
    "text to octal converter",
    "octal to text converter",
    "octal decoder",
    "octal encoder",
    "ascii to octal",
    "unicode to octal",
    "byte to octal converter",
    "encoding tools",
    "browser octal converter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/octal-encoder-decoder",
  },
  openGraph: {
    title: "Octal Encoder Decoder | Yoryantra",
    description:
      "Convert text and octal bytes while keeping ASCII limits, UTF-8 validity, and malformed groups visible.",
    url: "https://yoryantra.com/tools/octal-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Octal Encoder Decoder | Yoryantra",
    description:
      "Convert between text and byte-oriented octal with strict token and text-encoding boundaries.",
  },
};

export default function OctalEncoderDecoderPage() {
  return <ToolClient />;
}
