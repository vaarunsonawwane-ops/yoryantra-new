import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSV to Markdown Table Converter | Convert CSV to Markdown Online | Yoryantra",
  description:
    "Convert CSV data into clean Markdown tables. Handle headers, delimiters, quoted values, alignment, escaped pipes, trimmed cells, and table previews directly in your browser.",
  keywords: [
    "CSV to Markdown table converter",
    "CSV to Markdown",
    "convert CSV to Markdown table",
    "Markdown table generator",
    "CSV Markdown converter",
    "CSV to MD table",
    "Markdown table formatter",
    "data tools",
    "CSV tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csv-to-markdown-table-converter",
  },
  openGraph: {
    title: "CSV to Markdown Table Converter | Convert CSV to Markdown Online | Yoryantra",
    description:
      "Convert CSV data into clean Markdown tables. Handle headers, delimiters, quoted values, alignment, escaped pipes, trimmed cells, and table previews directly in your browser.",
    url: "https://yoryantra.com/tools/csv-to-markdown-table-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to Markdown Table Converter | Convert CSV to Markdown Online | Yoryantra",
    description:
      "Convert CSV data into clean Markdown tables. Handle headers, delimiters, quoted values, alignment, escaped pipes, trimmed cells, and table previews directly in your browser.",
  },
};

export default function CSVToMarkdownTableConverterPage() {
  return <ToolClient />;
}
