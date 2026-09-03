import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Headers Parser | Request & Response Fields | Yoryantra",
  description:
    "Parse raw HTTP request or response fields while preserving order and duplicates, then inspect start lines, pseudo-headers, malformed syntax and framing risks.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-headers-parser",
  },
  openGraph: {
    title: "HTTP Headers Parser | Request & Response Fields | Yoryantra",
    description:
      "Read HTTP request and response fields without losing order or duplicates, including pseudo-header and framing diagnostics.",
    url: "https://yoryantra.com/tools/http-headers-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Headers Parser | Yoryantra",
    description:
      "Read raw HTTP request and response fields without silently losing repeated values or order.",
  },
};

export default function Page() {
  return <ToolClient />;
}
