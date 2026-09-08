import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Percent Encoding Analyzer | URL Escape Diagnostics | Yoryantra",
  description:
    "Trace URL percent-encoded bytes, malformed escapes, UTF-8 failures, reserved delimiters, double encoding, and query plus handling.",
  keywords: [
    "Percent Encoding Analyzer",
    "percent encoding",
    "URL percent decoder",
    "percent escape analyzer",
    "malformed percent encoding",
    "UTF-8 percent encoding",
    "RFC 3986",
    "URL query decoding",
    "encoding tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/percent-encoding-analyzer",
  },
  openGraph: {
    title: "Percent Encoding Analyzer | URL Escape Diagnostics | Yoryantra",
    description:
      "Trace URL percent-encoded bytes, malformed escapes, UTF-8 failures, reserved delimiters, double encoding, and query plus handling.",
    url: "https://yoryantra.com/tools/percent-encoding-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Percent Encoding Analyzer | URL Escape Diagnostics | Yoryantra",
    description:
      "Trace URL percent-encoded bytes, malformed escapes, UTF-8 failures, reserved delimiters, double encoding, and query plus handling.",
  },
};

export default function PercentEncodingAnalyzerPage() {
  return <ToolClient />;
}
