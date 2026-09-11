import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSV Escape Formatter | Quote and Escape CSV Fields",
  description:
    "Quote CSV fields containing commas, quotation marks, line breaks, or boundary whitespace, with single-field and line-by-line modes and formula-risk guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/csv-escape-formatter",
  },
  openGraph: {
    title: "CSV Escape Formatter | Yoryantra",
    description:
      "Escape individual CSV fields with RFC-style quoting and clear boundaries around spreadsheet formula risks.",
    url: "https://yoryantra.com/tools/csv-escape-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CSV Escape Formatter | Yoryantra",
    description:
      "Quote CSV fields correctly while preserving commas, quotation marks, line breaks, and surrounding spaces.",
  },
};

export default function CsvEscapeFormatterPage() {
  return <ToolClient />;
}
