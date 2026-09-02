import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Request Formatter & Inspector | Yoryantra",
  description:
    "Inspect an HTTP/1.0 or HTTP/1.1 request line, headers, query parameters, body, Host and message-framing warnings without sending the request.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-request-formatter",
  },
  openGraph: {
    title: "HTTP Request Formatter & Inspector | Yoryantra",
    description:
      "Read an HTTP/1.x request line, headers, query, body and framing warnings without replaying the request.",
    url: "https://yoryantra.com/tools/http-request-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Request Formatter & Inspector | Yoryantra",
    description:
      "Inspect an HTTP/1.x request capture, including Host, Content-Length, Transfer-Encoding and credential-like headers.",
  },
};

export default function Page() {
  return <ToolClient />;
}
