import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Request Header Builder | HTTP, cURL & Fetch Headers | Yoryantra",
  description:
    "Build HTTP request headers with field-name checks, duplicate preservation, Basic encoding, secret masking, and cURL, JSON-pair, or Fetch output.",
  keywords: [
    "request header builder",
    "HTTP header builder",
    "cURL headers",
    "Fetch headers",
    "Authorization header",
    "Basic auth header",
    "Bearer token header",
    "HTTP field name validator",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/request-header-builder",
  },
  openGraph: {
    title: "Request Header Builder | HTTP, cURL & Fetch Headers | Yoryantra",
    description:
      "Build validated request headers with duplicate-field preservation, safer secret masking, and cURL or Fetch output.",
    url: "https://yoryantra.com/tools/request-header-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Request Header Builder | HTTP, cURL & Fetch Headers | Yoryantra",
    description:
      "Build and validate HTTP request headers, then export header blocks, cURL flags, JSON pairs, or Fetch headers.",
  },
};

export default function RequestHeaderBuilderPage() {
  return <ToolClient />;
}
