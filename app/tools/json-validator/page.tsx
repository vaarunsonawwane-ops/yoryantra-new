import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Validator | Find Syntax Errors & Duplicate Keys",
  description:
    "Validate JSON syntax, locate parser errors, pretty-print valid JSON, and flag duplicate keys, unsafe integers, BOMs, and lone surrogate edge cases.",
  keywords: [
    "json validator",
    "json syntax checker",
    "validate json",
    "json error checker",
    "json parser error",
    "json formatter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-validator",
  },
  openGraph: {
    title: "JSON Validator | Yoryantra",
    description:
      "Validate JSON syntax, inspect parser errors, and keep duplicate keys, large integers, and Unicode interoperability warnings visible.",
    url: "https://yoryantra.com/tools/json-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Validator | Yoryantra",
    description:
      "Validate JSON syntax, locate errors, and format valid JSON with interoperability warnings.",
  },
};

export default function Page() {
  return <ToolClient />;
}
