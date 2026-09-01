import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Request Formatter | Request Diagnostics | Yoryantra",
  description:
    "Format raw HTTP/1.x requests and inspect request lines, headers, query parameters, framing, body media types, sensitive fields and common request defects.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-request-formatter",
  },
  openGraph: {
    title: "HTTP Request Formatter | Yoryantra",
    description:
      "Turn a raw HTTP request capture into a readable request-line, header, query, body and framing review without sending the request.",
    url: "https://yoryantra.com/tools/http-request-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Request Formatter | Yoryantra",
    description:
      "Format raw HTTP requests and inspect header, query, body, framing and credential-handling issues locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
