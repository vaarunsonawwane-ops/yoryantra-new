import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to Markdown Table Converter | GFM Table Output",
  description:
    "Turn JSON records into GitHub Flavored Markdown tables with collision-safe nested paths, column selection, explicit missing values, and escaped cells.",
  keywords: [
    "json to markdown table",
    "json to markdown converter",
    "json array to markdown table",
    "github markdown table json",
    "gfm table json",
    "flatten json table",
    "markdown table generator json",
    "json documentation table",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-markdown-table-converter",
  },
  openGraph: {
    title: "JSON to Markdown Table Converter | Yoryantra",
    description:
      "Turn JSON records into GFM tables while keeping nested paths, missing fields, and pipe characters explicit.",
    url: "https://yoryantra.com/tools/json-to-markdown-table-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to Markdown Table Converter | Yoryantra",
    description:
      "Convert JSON records to GFM tables with controlled flattening, columns, missing values, and escaping.",
  },
};

export default function JsonToMarkdownTableConverterPage() {
  return <ToolClient />;
}
