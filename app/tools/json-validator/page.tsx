import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Validator & Syntax Checker | Find JSON Errors",
  description:
    "Validate JSON syntax in your browser, locate parse errors, pretty-print valid JSON, and flag duplicate keys or large integers that can cause interoperability issues.",
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
    title: "JSON Validator & Syntax Checker | Yoryantra",
    description:
      "Validate JSON syntax, inspect parse errors, and format valid JSON with practical interoperability warnings.",
    url: "https://yoryantra.com/tools/json-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Validator & Syntax Checker | Yoryantra",
    description:
      "Validate JSON syntax, locate errors, and format valid JSON directly in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
