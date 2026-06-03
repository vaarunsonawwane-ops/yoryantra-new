import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Request Parser | Parse Raw HTTP Requests Online | Yoryantra",
  description:
    "Parse raw HTTP requests, inspect methods, URLs, headers, query parameters, cookies, and request bodies directly in your browser.",
  keywords: [
    "HTTP request parser",
    "raw HTTP request parser",
    "parse HTTP request",
    "HTTP header parser",
    "request body parser",
    "curl request parser",
    "HTTP debugging tool",
    "API debugging tools",
    "developer tools",
    "web debugging tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/http-request-parser",
  },
  openGraph: {
    title: "HTTP Request Parser | Parse Raw HTTP Requests Online | Yoryantra",
    description:
      "Parse raw HTTP requests, inspect methods, URLs, headers, query parameters, cookies, and request bodies directly in your browser.",
    url: "https://yoryantra.com/tools/http-request-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Request Parser | Parse Raw HTTP Requests Online | Yoryantra",
    description:
      "Parse raw HTTP requests, inspect methods, URLs, headers, query parameters, cookies, and request bodies directly in your browser.",
  },
};

export default function HTTPRequestParserPage() {
  return <ToolClient />;
}
