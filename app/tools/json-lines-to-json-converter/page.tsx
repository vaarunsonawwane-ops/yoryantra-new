import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Lines to JSON Converter | JSONL and NDJSON Records",
  description:
    "Convert JSONL or NDJSON records to a JSON array, inspect malformed lines, or emit one compact JSON value per line from JSON data.",
  keywords: [
    "json lines to json converter",
    "jsonl to json",
    "ndjson to json",
    "jsonl to json array",
    "json array to jsonl",
    "newline delimited json",
    "json lines validator",
    "jsonl line errors",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-lines-to-json-converter",
  },
  openGraph: {
    title: "JSON Lines to JSON Converter | Yoryantra",
    description:
      "Move between JSON arrays and one-record-per-line JSON while keeping malformed source lines visible.",
    url: "https://yoryantra.com/tools/json-lines-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Lines to JSON Converter | Yoryantra",
    description:
      "Convert JSONL and NDJSON records, inspect line failures, or emit compact newline-delimited JSON.",
  },
};

export default function JsonLinesToJsonConverterPage() {
  return <ToolClient />;
}
