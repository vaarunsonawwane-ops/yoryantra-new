import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Minifier | Whitespace-Only Minification | Yoryantra",
  description:
    "Minify valid JSON by removing insignificant whitespace outside strings while preserving number spellings, duplicate member text, escapes, and key order.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-minifier",
  },
  openGraph: {
    title: "JSON Minifier | Whitespace-Only Minification | Yoryantra",
    description:
      "Shrink JSON source text without a parse-and-stringify round trip that can hide duplicate names or rewrite numeric values.",
    url: "https://yoryantra.com/tools/json-minifier",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Minifier | Yoryantra",
    description:
      "Remove JSON formatting whitespace while keeping the original source tokens intact.",
  },
};

export default function Page() {
  return <ToolClient />;
}
