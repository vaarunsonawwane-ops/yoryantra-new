import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Key Extractor | Extract Keys and Paths from JSON | Yoryantra",

  description:
    "Extract keys, dot notation paths, value types, and nested field structure from JSON directly in your browser.",

  keywords: [
    "JSON key extractor",
    "extract JSON keys",
    "JSON path extractor",
    "JSON field extractor",
    "JSON dot notation keys",
    "nested JSON keys",
    "JSON structure analyzer",
    "JSON data tools",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/json-key-extractor",
  },

  openGraph: {
    title: "JSON Key Extractor | Extract Keys and Paths from JSON | Yoryantra",

    description:
      "Extract keys, dot notation paths, value types, and nested field structure from JSON directly in your browser.",

    url: "https://yoryantra.com/tools/json-key-extractor",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JSON Key Extractor | Extract Keys and Paths from JSON | Yoryantra",

    description:
      "Extract keys, dot notation paths, value types, and nested field structure from JSON directly in your browser.",
  },
};

export default function JSONKeyExtractorPage() {
  return <ToolClient />;
}
