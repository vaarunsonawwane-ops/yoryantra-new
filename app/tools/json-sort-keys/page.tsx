import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Sort Keys Tool | Sort JSON Object Keys Online | Yoryantra",
  description:
    "Sort JSON object keys alphabetically, reorder nested JSON keys, and format structured JSON directly in your browser.",
  keywords: [
    "JSON sort keys",
    "sort JSON keys",
    "JSON key sorter",
    "sort JSON alphabetically",
    "JSON object key sorter",
    "nested JSON sort keys",
    "JSON formatter",
    "JSON data tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-sort-keys",
  },
  openGraph: {
    title: "JSON Sort Keys Tool | Sort JSON Object Keys Online | Yoryantra",
    description:
      "Sort JSON object keys alphabetically, reorder nested JSON keys, and format structured JSON directly in your browser.",
    url: "https://yoryantra.com/tools/json-sort-keys",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Sort Keys Tool | Sort JSON Object Keys Online | Yoryantra",
    description:
      "Sort JSON object keys alphabetically, reorder nested JSON keys, and format structured JSON directly in your browser.",
  },
};

export default function JSONSortKeysPage() {
  return <ToolClient />;
}
