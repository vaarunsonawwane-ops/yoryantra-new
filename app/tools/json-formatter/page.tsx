import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Formatter | Pretty Print JSON Safely | Yoryantra",
  description:
    "Format valid JSON with configurable indentation while preserving number spellings, key order, and duplicate-key text for inspection.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-formatter",
  },
  openGraph: {
    title: "JSON Formatter | Yoryantra",
    description:
      "Pretty print JSON, inspect syntax errors, and review duplicate keys or unsafe integer literals in your browser.",
    url: "https://yoryantra.com/tools/json-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatter | Yoryantra",
    description:
      "Pretty print JSON and inspect syntax, duplicate keys, and numeric precision risks locally in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
