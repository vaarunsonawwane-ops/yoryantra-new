import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Encoder Decoder | Percent-Encoding Tool | Yoryantra",
  description:
    "Encode and decode URL components, full URI text, and form-style values with RFC 3986 percent-encoding guidance, UTF-8 handling, and malformed-escape checks.",
  alternates: {
    canonical: "https://yoryantra.com/tools/url-encoder-decoder",
  },
  openGraph: {
    title: "URL Encoder Decoder | Percent-Encoding Tool | Yoryantra",
    description:
      "Encode or decode URL components, full URI text, and form-style values with context-aware percent encoding.",
    url: "https://yoryantra.com/tools/url-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "URL Encoder Decoder | Yoryantra",
    description:
      "Encode or decode URL components, full URI text, and form-style query values.",
  },
};

export default function Page() {
  return <ToolClient />;
}
