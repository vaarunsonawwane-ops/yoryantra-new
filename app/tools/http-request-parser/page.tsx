import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Request Parser | Read Raw HTTP/1.x Requests | Yoryantra",
  description:
    "Parse raw HTTP/1.0 and HTTP/1.1 requests into request-line, target form, headers, query parameters, cookies, and body details.",
  keywords: [
    "HTTP request parser",
    "raw HTTP request parser",
    "parse HTTP request",
    "HTTP header parser",
    "request body parser",
    "HTTP request line",
    "HTTP target forms",
    "HTTP message framing",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/http-request-parser",
  },
  openGraph: {
    title: "HTTP Request Parser | Read Raw HTTP/1.x Requests | Yoryantra",
    description:
      "Parse raw HTTP/1.0 and HTTP/1.1 requests into request-line, target form, headers, query parameters, cookies, and body details.",
    url: "https://yoryantra.com/tools/http-request-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Request Parser | Read Raw HTTP/1.x Requests | Yoryantra",
    description:
      "Parse raw HTTP/1.0 and HTTP/1.1 requests into request-line, target form, headers, query parameters, cookies, and body details.",
  },
};

export default function HTTPRequestParserPage() {
  return <ToolClient />;
}
