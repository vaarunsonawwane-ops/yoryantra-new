import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Request Formatter | Parse Raw HTTP Requests",
  description:
    "Format and inspect raw HTTP requests, request lines, headers, query parameters, JSON or form bodies, Content-Length, and common request issues locally in your browser.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-request-formatter",
  },
  openGraph: {
    title: "HTTP Request Formatter | Yoryantra",
    description:
      "Parse a raw HTTP request into method, target, headers, query parameters, body details, and practical diagnostics.",
    url: "https://yoryantra.com/tools/http-request-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Request Formatter | Yoryantra",
    description:
      "Format raw HTTP requests and inspect headers, query parameters, body content, and request diagnostics locally.",
  },
};

export default function HTTPRequestFormatterPage() {
  return <ToolClient />;
}
