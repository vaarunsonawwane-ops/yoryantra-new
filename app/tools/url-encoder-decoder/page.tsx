import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Encoder Decoder — Component, Full URL & Form | Yoryantra",
  description:
    "Encode and decode URL components, complete URLs, and form values. Understand percent-encoding, UTF-8, + vs %20, malformed escapes, and double encoding.",
  alternates: {
    canonical: "https://yoryantra.com/tools/url-encoder-decoder",
  },
  openGraph: {
    title: "URL Encoder Decoder — Component, Full URL & Form | Yoryantra",
    description:
      "Percent-encode and decode URL components, full URLs, and form-style values with practical guidance on reserved characters and encoding context.",
    url: "https://yoryantra.com/tools/url-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Encoder Decoder | Yoryantra",
    description:
      "Encode and decode URL components, full URLs, and form-style values with context-aware modes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
