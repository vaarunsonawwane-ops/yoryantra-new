import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Response Formatter – Inspect Raw Responses | Yoryantra",

  description:
    "Format textual HTTP response captures, inspect status lines, headers, Set-Cookie attributes, redirects and JSON bodies, and surface syntax notes locally.",

  keywords: [
    "http response formatter",
    "raw http response formatter",
    "format http response",
    "http response parser",
    "http headers formatter",
    "api response formatter",
    "parse http response",
    "status code checker",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/http-response-formatter",
  },

  openGraph: {
    title: "HTTP Response Formatter – Inspect Raw Responses | Yoryantra",

    description:
      "Format textual HTTP response captures, inspect status lines, headers, Set-Cookie attributes, redirects and JSON bodies, and surface syntax notes locally.",

    url: "https://yoryantra.com/tools/http-response-formatter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "HTTP Response Formatter – Inspect Raw Responses | Yoryantra",

    description:
      "Format textual HTTP response captures, inspect status lines, headers, Set-Cookie attributes, redirects and JSON bodies, and surface syntax notes locally.",
  },
};

export default function HTTPResponseFormatterPage() {
  return <ToolClient />;
}
