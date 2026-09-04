import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Formatter | Preserve Source Tokens | Yoryantra",
  description:
    "Pretty-print valid JSON while keeping number spellings, duplicate member text, escapes, and key order visible, with precision and interoperability warnings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-formatter",
  },
  openGraph: {
    title: "JSON Formatter | Preserve Source Tokens | Yoryantra",
    description:
      "Pretty-print JSON without a parse-and-stringify round trip that can rewrite numbers or hide duplicate object members.",
    url: "https://yoryantra.com/tools/json-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Formatter | Yoryantra",
    description:
      "Pretty-print JSON while preserving source token spellings and surfacing duplicate-key and number-precision risks.",
  },
};

export default function Page() {
  return <ToolClient />;
}
