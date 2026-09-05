import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSV to Markdown Table Converter | Yoryantra",
  description:
    "Parse CSV, TSV, semicolon, or pipe-delimited rows into Markdown tables with quoted-field handling, delimiter checks, row normalization, and previews.",
  keywords: [
    "CSV to Markdown",
    "CSV to Markdown table",
    "TSV to Markdown",
    "Markdown table from CSV",
    "delimited text to Markdown",
    "GFM table converter",
    "CSV quoted fields",
    "CSV delimiter detection",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csv-to-markdown-table-converter",
  },
  openGraph: {
    title: "CSV to Markdown Table Converter | Yoryantra",
    description:
      "Turn delimited rows into Markdown tables while checking quoted fields, delimiter ambiguity, uneven rows, and pipe escaping.",
    url: "https://yoryantra.com/tools/csv-to-markdown-table-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to Markdown Table Converter | Yoryantra",
    description:
      "Turn delimited rows into Markdown tables while checking quoted fields, delimiter ambiguity, uneven rows, and pipe escaping.",
  },
};

export default function CSVToMarkdownTableConverterPage() {
  return <ToolClient />;
}
