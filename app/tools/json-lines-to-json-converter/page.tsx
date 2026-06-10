import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Lines to JSON Converter Online | Convert JSONL and NDJSON",
  description:
    "Convert JSON Lines to JSON arrays, convert NDJSON to JSON, inspect line-by-line records, and turn JSON arrays back into newline-delimited JSON in your browser.",
  keywords: [
    "json lines to json converter",
    "jsonl to json converter",
    "jsonl to json array",
    "ndjson to json converter",
    "ndjson to json array",
    "json lines converter",
    "json to json lines",
    "json array to json lines",
    "newline delimited json converter",
    "convert jsonl to json",
    "convert ndjson to json",
    "json to json",
    "json data tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-lines-to-json-converter",
  },
  openGraph: {
    title: "JSON Lines to JSON Converter Online | Yoryantra",
    description:
      "Convert JSONL and NDJSON into JSON arrays, inspect broken records, and export JSON arrays as newline-delimited JSON locally in your browser.",
    url: "https://yoryantra.com/tools/json-lines-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Lines to JSON Converter Online | Yoryantra",
    description:
      "Convert JSON Lines and NDJSON into JSON arrays, inspect records, or turn JSON arrays into JSONL.",
  },
};

export default function JsonLinesToJsonConverterPage() {
  return <ToolClient />;
}
