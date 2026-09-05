import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Key Extractor | Paths, Types & Arrays | Yoryantra",
  description:
    "Extract JSON member names, escaped nested paths, observed value types, array-aware structure, and terminal fields from pasted JSON.",
  keywords: [
    "JSON key extractor",
    "extract JSON keys",
    "JSON nested paths",
    "JSON field names",
    "JSON array paths",
    "JSON value types",
    "JSON structure inspector",
    "JSON data mapping",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-key-extractor",
  },
  openGraph: {
    title: "JSON Key Extractor | Yoryantra",
    description:
      "List JSON member names, escaped paths, observed value types, and array-aware structure without hiding array boundaries.",
    url: "https://yoryantra.com/tools/json-key-extractor",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Key Extractor | Yoryantra",
    description:
      "List JSON member names, escaped paths, observed value types, and array-aware structure without hiding array boundaries.",
  },
};

export default function JSONKeyExtractorPage() {
  return <ToolClient />;
}
