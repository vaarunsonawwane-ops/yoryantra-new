import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Array Filter Tool | Filter JSON Records by Key and Value",
  description:
    "Filter JSON array records by key, value, comparison rule, and dot path. Preview matching records and export filtered JSON, Markdown, CSV, or checklist output locally.",
  keywords: [
    "json array filter tool",
    "filter json array",
    "json filter by key",
    "json filter by value",
    "json array search tool",
    "filter json records",
    "json data filter",
    "json dot path filter",
    "json data tools",
    "browser json tool",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-array-filter-tool",
  },
  openGraph: {
    title: "JSON Array Filter Tool | Yoryantra",
    description:
      "Filter JSON array records by key, value, condition, and dot path without uploading your data.",
    url: "https://yoryantra.com/tools/json-array-filter-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Array Filter Tool | Yoryantra",
    description:
      "Filter JSON array records locally by key, value, comparison rule, and dot path.",
  },
};

export default function JsonArrayFilterToolPage() {
  return <ToolClient />;
}
