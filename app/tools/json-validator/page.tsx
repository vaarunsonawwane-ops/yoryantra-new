import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Validator | Syntax & Duplicate Keys | Yoryantra",
  description:
    "Validate JSON syntax, locate parser errors, flag duplicate object keys and risky number values, and format valid JSON while preserving source tokens.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-validator",
  },
  openGraph: {
    title: "JSON Validator | Yoryantra",
    description:
      "Check JSON syntax, parser errors, duplicate keys, root value type, number interoperability, and formatted structure directly in your browser.",
    url: "https://yoryantra.com/tools/json-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Validator | Yoryantra",
    description:
      "Validate JSON syntax and inspect duplicate keys, parser locations, risky numbers, and formatted output locally in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
