import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "cURL Command Parser | Read HTTP cURL Requests | Yoryantra",
  description:
    "Parse one HTTP(S) cURL command into method, URL, headers, cookies, body data, and supported curl flags without sending the request.",
  keywords: [
    "cURL command parser",
    "parse curl command",
    "curl request parser",
    "curl to HTTP request",
    "curl header parser",
    "curl body parser",
    "curl command syntax",
    "HTTP request details",
    "curl headers and body",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/curl-command-parser",
  },
  openGraph: {
    title: "cURL Command Parser | Read HTTP cURL Requests | Yoryantra",
    description:
      "Parse one HTTP(S) cURL command into method, URL, headers, cookies, body data, and supported curl flags without sending the request.",
    url: "https://yoryantra.com/tools/curl-command-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cURL Command Parser | Read HTTP cURL Requests | Yoryantra",
    description:
      "Parse one HTTP(S) cURL command into method, URL, headers, cookies, body data, and supported curl flags without sending the request.",
  },
};

export default function CurlCommandParserPage() {
  return <ToolClient />;
}
