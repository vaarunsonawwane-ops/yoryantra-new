import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Validator | Check Syntax, Errors & Duplicate Keys",
  description:
    "Validate JSON syntax, locate parser errors, flag duplicate object keys and risky number values, and format valid JSON without rewriting source tokens.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-validator",
  },
  openGraph: {
    title: "JSON Validator | Yoryantra",
    description:
      "Check JSON syntax, parser errors, duplicate keys, root value type, and formatted structure directly in your browser.",
    url: "https://yoryantra.com/tools/json-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Validator | Yoryantra",
    description:
      "Validate JSON syntax and inspect duplicate keys, parser locations, and formatted output locally in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
