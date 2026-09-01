import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Headers Parser | Read Request & Response Headers | Yoryantra",
  description:
    "Parse raw HTTP request or response headers into ordered fields, preserve repeated values, inspect start lines and pseudo-fields, and flag malformed or risky framing patterns.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-headers-parser",
  },
  openGraph: {
    title: "HTTP Headers Parser | Read Request & Response Headers | Yoryantra",
    description:
      "Turn pasted HTTP headers into structured data while preserving duplicates, order, start lines, and useful diagnostics.",
    url: "https://yoryantra.com/tools/http-headers-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Headers Parser | Yoryantra",
    description:
      "Parse and understand raw HTTP request and response headers without silently losing repeated fields.",
  },
};

export default function Page() {
  return <ToolClient />;
}
