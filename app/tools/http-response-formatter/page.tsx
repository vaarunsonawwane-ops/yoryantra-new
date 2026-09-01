import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Response Formatter | Status, Headers & Body | Yoryantra",
  description:
    "Format HTTP response captures and inspect status, repeated headers, cookies, redirects, body media types, Content-Length and framing diagnostics locally.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-response-formatter",
  },
  openGraph: {
    title: "HTTP Response Formatter | Yoryantra",
    description:
      "Turn a textual HTTP response capture into readable status, header, cookie, body and framing diagnostics without replaying the request.",
    url: "https://yoryantra.com/tools/http-response-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Response Formatter | Yoryantra",
    description:
      "Format HTTP responses and review repeated fields, cookies, redirects, JSON bodies and message-framing clues locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
