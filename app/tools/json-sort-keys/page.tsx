import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Sort Keys Tool | Deterministic Key Order | Yoryantra",
  description:
    "Sort JSON object keys recursively with locale-independent ordering while preserving array sequence and rejecting precision-losing numeric input.",
  keywords: [
    "JSON sort keys",
    "sort JSON object keys",
    "recursive JSON key sort",
    "deterministic JSON ordering",
    "JSON key order",
    "sort JSON alphabetically",
    "JSON diff cleanup",
    "JSON data tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-sort-keys",
  },
  openGraph: {
    title: "JSON Sort Keys Tool | Yoryantra",
    description:
      "Sort object keys recursively with deterministic UTF-16 ordering while keeping every array element in place.",
    url: "https://yoryantra.com/tools/json-sort-keys",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Sort Keys Tool | Yoryantra",
    description:
      "Sort object keys recursively with deterministic UTF-16 ordering while keeping every array element in place.",
  },
};

export default function JSONSortKeysPage() {
  return <ToolClient />;
}
