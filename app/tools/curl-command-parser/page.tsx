import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "cURL Command Parser | Parse cURL Requests Online | Yoryantra",
  description:
    "Parse cURL commands into method, URL, headers, cookies, body, and request details directly in your browser.",
  keywords: [
    "cURL command parser",
    "parse curl command",
    "curl request parser",
    "curl to HTTP request",
    "curl header parser",
    "curl body parser",
    "API debugging tool",
    "HTTP debugging tool",
    "developer tools",
    "API tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/curl-command-parser",
  },
  openGraph: {
    title: "cURL Command Parser | Parse cURL Requests Online | Yoryantra",
    description:
      "Parse cURL commands into method, URL, headers, cookies, body, and request details directly in your browser.",
    url: "https://yoryantra.com/tools/curl-command-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cURL Command Parser | Parse cURL Requests Online | Yoryantra",
    description:
      "Parse cURL commands into method, URL, headers, cookies, body, and request details directly in your browser.",
  },
};

export default function CurlCommandParserPage() {
  return <ToolClient />;
}
