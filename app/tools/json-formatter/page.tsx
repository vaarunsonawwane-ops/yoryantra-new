import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Formatter | Pretty Print Without Data Loss | Yoryantra",
  description:
    "Pretty-print valid JSON while preserving source number spellings, duplicate member text, escape sequences, and key order, with precision diagnostics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-formatter",
  },
  openGraph: {
    title: "JSON Formatter | Pretty Print Without Data Loss | Yoryantra",
    description:
      "Format JSON for reading without rebuilding it from JavaScript values and silently rewriting important source tokens.",
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
