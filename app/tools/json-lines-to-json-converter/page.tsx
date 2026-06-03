import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Lines to JSON Converter | Convert JSONL and NDJSON",
  description:
    "Convert JSON Lines and NDJSON into JSON arrays, inspect line-by-line records, and convert JSON arrays back into newline-delimited JSON locally in your browser.",
  keywords: [
    "json lines to json converter",
    "jsonl to json converter",
    "ndjson to json converter",
    "json lines converter",
    "convert jsonl to json array",
    "json array to json lines",
    "newline delimited json converter",
    "ndjson formatter",
    "json data tools",
    "browser json converter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-lines-to-json-converter",
  },
  openGraph: {
    title: "JSON Lines to JSON Converter | Yoryantra",
    description:
      "Convert JSONL and NDJSON into JSON arrays, inspect records, and export JSON Lines from arrays without uploading your data.",
    url: "https://yoryantra.com/tools/json-lines-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Lines to JSON Converter | Yoryantra",
    description:
      "Convert JSON Lines and NDJSON into JSON arrays, or turn JSON arrays back into newline-delimited records.",
  },
};

export default function JsonLinesToJsonConverterPage() {
  return <ToolClient />;
}
