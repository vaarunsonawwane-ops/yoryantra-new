import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Query Encoder Decoder | Query Parameters & Form Encoding | Yoryantra",
  description:
    "Decode ordered URL query parameters or encode key-value pairs with percent encoding, form-style plus handling, duplicate keys, and malformed-input checks.",
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
    title: "URL Query Encoder Decoder | Query Parameters & Form Encoding | Yoryantra",
    description:
      "Decode ordered URL query parameters or encode key-value pairs with percent encoding, form-style plus handling, duplicate keys, and malformed-input checks.",
    url: "https://yoryantra.com/tools/url-query-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Query Encoder Decoder | Query Parameters & Form Encoding | Yoryantra",
    description:
      "Decode ordered URL query parameters or encode key-value pairs with percent encoding, form-style plus handling, duplicate keys, and malformed-input checks.",
  },
};

export default function URLQueryEncoderDecoderPage() {
  return <ToolClient />;
}
