import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Query Encoder Decoder | Encode and Decode Query Strings | Yoryantra",
  description:
    "Encode and decode URL query strings, query parameters, form-style values, plus signs, percent encoding, and copied URL query text directly in your browser.",
  keywords: [
    "URL query encoder decoder",
    "query string encoder decoder",
    "URL query decoder",
    "URL query encoder",
    "query parameter decoder",
    "query parameter encoder",
    "percent encoding decoder",
    "application x-www-form-urlencoded decoder",
    "Encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/url-query-encoder-decoder",
  },
  openGraph: {
    title: "URL Query Encoder Decoder | Encode and Decode Query Strings | Yoryantra",
    description:
      "Encode and decode URL query strings, query parameters, form-style values, plus signs, percent encoding, and copied URL query text directly in your browser.",
    url: "https://yoryantra.com/tools/url-query-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Query Encoder Decoder | Encode and Decode Query Strings | Yoryantra",
    description:
      "Encode and decode URL query strings, query parameters, form-style values, plus signs, percent encoding, and copied URL query text directly in your browser.",
  },
};

export default function URLQueryEncoderDecoderPage() {
  return <ToolClient />;
}
