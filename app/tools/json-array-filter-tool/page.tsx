import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Array Filter Tool – Filter Records by Key or Value | Yoryantra",
  description:
    "Filter JSON array records by key, value, number, boolean, regex, missing field, or nested dot path while preserving the original record structure.",
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
    title: "JSON Array Filter Tool – Filter Records by Key or Value | Yoryantra",
    description:
    "Filter JSON array records by key, value, number, boolean, regex, missing field, or nested dot path while preserving the original record structure.",
    url: "https://yoryantra.com/tools/json-array-filter-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Array Filter Tool – Filter Records by Key or Value | Yoryantra",
    description:
    "Filter JSON array records by key, value, number, boolean, regex, missing field, or nested dot path while preserving the original record structure.",
  },
};

export default function JsonArrayFilterToolPage() {
  return <ToolClient />;
}
