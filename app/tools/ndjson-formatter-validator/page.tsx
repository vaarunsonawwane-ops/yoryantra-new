import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "NDJSON Formatter Validator | Validate Newline Delimited JSON Online | Yoryantra",
  description:
    "Validate, format, compact, and inspect NDJSON newline-delimited JSON. Find line errors, parse JSONL logs, count records, and convert NDJSON to JSON array directly in your browser.",
  keywords: [
    "NDJSON formatter validator",
    "NDJSON validator",
    "NDJSON formatter",
    "JSONL validator",
    "JSON lines formatter",
    "newline delimited JSON validator",
    "NDJSON to JSON array",
    "JSONL formatter",
    "JSON tools",
    "data tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/ndjson-formatter-validator",
  },
  openGraph: {
    title: "NDJSON Formatter Validator | Validate Newline Delimited JSON Online | Yoryantra",
    description:
      "Validate, format, compact, and inspect NDJSON newline-delimited JSON. Find line errors, parse JSONL logs, count records, and convert NDJSON to JSON array directly in your browser.",
    url: "https://yoryantra.com/tools/ndjson-formatter-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NDJSON Formatter Validator | Validate Newline Delimited JSON Online | Yoryantra",
    description:
      "Validate, format, compact, and inspect NDJSON newline-delimited JSON. Find line errors, parse JSONL logs, count records, and convert NDJSON to JSON array directly in your browser.",
  },
};

export default function NDJSONFormatterValidatorPage() {
  return <ToolClient />;
}
