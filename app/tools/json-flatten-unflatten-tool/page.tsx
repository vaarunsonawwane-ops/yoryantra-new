import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Flatten / Unflatten Tool | Convert Nested JSON Online | Yoryantra",

  description:
    "Flatten nested JSON into dot notation paths or unflatten dot notation JSON back into nested objects directly in your browser.",

  keywords: [
    "JSON flatten tool",
    "JSON unflatten tool",
    "flatten JSON online",
    "unflatten JSON online",
    "nested JSON converter",
    "JSON dot notation",
    "JSON path converter",
    "JSON data tools",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/json-flatten-unflatten-tool",
  },

  openGraph: {
    title: "JSON Flatten / Unflatten Tool | Yoryantra",

    description:
      "Flatten nested JSON into dot notation paths or rebuild nested JSON from flattened key paths.",

    url: "https://yoryantra.com/tools/json-flatten-unflatten-tool",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JSON Flatten / Unflatten Tool | Yoryantra",

    description:
      "Flatten nested JSON into dot notation paths or rebuild nested JSON from flattened key paths.",
  },
};

export default function JSONFlattenUnflattenPage() {
  return <ToolClient />;
}
