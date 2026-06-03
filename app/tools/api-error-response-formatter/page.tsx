import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "API Error Response Formatter | Format API Error JSON Online | Yoryantra",
  description:
    "Format API error responses, extract error codes, messages, validation errors, traces, and useful debugging details directly in your browser.",
  keywords: [
    "API error response formatter",
    "API error formatter",
    "format API error JSON",
    "JSON error response formatter",
    "API error parser",
    "validation error formatter",
    "HTTP error response formatter",
    "API debugging tools",
    "developer tools",
    "JSON tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/api-error-response-formatter",
  },
  openGraph: {
    title: "API Error Response Formatter | Format API Error JSON Online | Yoryantra",
    description:
      "Format API error responses, extract error codes, messages, validation errors, traces, and useful debugging details directly in your browser.",
    url: "https://yoryantra.com/tools/api-error-response-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Error Response Formatter | Format API Error JSON Online | Yoryantra",
    description:
      "Format API error responses, extract error codes, messages, validation errors, traces, and useful debugging details directly in your browser.",
  },
};

export default function APIErrorResponseFormatterPage() {
  return <ToolClient />;
}
