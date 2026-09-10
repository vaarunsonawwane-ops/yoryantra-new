import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "API Error Response Formatter | JSON & HTTP Errors | Yoryantra",
  description:
    "Parse JSON API errors or raw HTTP responses, extract status and validation details, recognize RFC 9457 Problem Details, and mask trace IDs before sharing.",
  keywords: [
    "API error response formatter",
    "API error parser",
    "HTTP error response parser",
    "JSON error formatter",
    "RFC 9457 problem details",
    "validation error parser",
    "trace ID formatter",
    "request ID parser",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/api-error-response-formatter",
  },
  openGraph: {
    title: "API Error Response Formatter | JSON & HTTP Errors | Yoryantra",
    description:
      "Parse JSON API errors or raw HTTP responses, recognize common error shapes, and prepare clearer debugging output.",
    url: "https://yoryantra.com/tools/api-error-response-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Error Response Formatter | JSON & HTTP Errors | Yoryantra",
    description:
      "Parse JSON and raw HTTP API errors into readable status, validation, trace, and Problem Details fields.",
  },
};

export default function APIErrorResponseFormatterPage() {
  return <ToolClient />;
}
