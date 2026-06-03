import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Percent Encoding Analyzer | Inspect URL Percent Escapes Online | Yoryantra",
  description:
    "Analyze percent-encoded URL text. Inspect %XX escapes, decode UTF-8 bytes, find malformed percent encoding, compare raw and decoded values, and debug URLs directly in your browser.",
  keywords: [
    "Percent Encoding Analyzer",
    "percent encoding checker",
    "URL percent decoder",
    "percent escape analyzer",
    "malformed percent encoding",
    "URL escape checker",
    "decode percent encoded string",
    "URL debugging tool",
    "encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/percent-encoding-analyzer",
  },
  openGraph: {
    title: "Percent Encoding Analyzer | Inspect URL Percent Escapes Online | Yoryantra",
    description:
      "Analyze percent-encoded URL text. Inspect %XX escapes, decode UTF-8 bytes, find malformed percent encoding, compare raw and decoded values, and debug URLs directly in your browser.",
    url: "https://yoryantra.com/tools/percent-encoding-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Percent Encoding Analyzer | Inspect URL Percent Escapes Online | Yoryantra",
    description:
      "Analyze percent-encoded URL text. Inspect %XX escapes, decode UTF-8 bytes, find malformed percent encoding, compare raw and decoded values, and debug URLs directly in your browser.",
  },
};

export default function PercentEncodingAnalyzerPage() {
  return <ToolClient />;
}
