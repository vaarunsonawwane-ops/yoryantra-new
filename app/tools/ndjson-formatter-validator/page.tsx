import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "NDJSON Formatter Validator | JSONL Line Checker | Yoryantra",
  description:
    "Validate one JSON value per line, locate NDJSON or JSONL failures, compact valid records, inspect types, and convert verified records to a JSON array.",
  keywords: [
    "NDJSON validator",
    "NDJSON formatter",
    "JSONL validator",
    "JSON Lines checker",
    "newline delimited JSON",
    "NDJSON to JSON array",
    "JSONL line errors",
    "application x-ndjson",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/ndjson-formatter-validator",
  },
  openGraph: {
    title: "NDJSON Formatter Validator | JSONL Line Checker | Yoryantra",
    description:
      "Check NDJSON one record at a time, find exact failing lines, preserve compact line-delimited output, and convert valid records when needed.",
    url: "https://yoryantra.com/tools/ndjson-formatter-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NDJSON Formatter Validator | JSONL Line Checker | Yoryantra",
    description:
      "Check NDJSON one record at a time, find exact failing lines, preserve compact line-delimited output, and convert valid records when needed.",
  },
};

export default function NDJSONFormatterValidatorPage() {
  return <ToolClient />;
}
