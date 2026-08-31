import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Minifier | Remove JSON Whitespace | Yoryantra",
  description:
    "Minify valid JSON by removing insignificant whitespace while preserving token spelling, key order, and duplicate-key text for inspection.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-minifier",
  },
  openGraph: {
    title: "JSON Minifier | Yoryantra",
    description:
      "Remove JSON formatting whitespace and compare UTF-8 byte size without reserializing the parsed value.",
    url: "https://yoryantra.com/tools/json-minifier",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Minifier | Yoryantra",
    description:
      "Minify JSON locally and inspect size savings, duplicate keys, and numeric precision cautions.",
  },
};

export default function Page() {
  return <ToolClient />;
}
