import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to Markdown Table Converter | Convert JSON Arrays to Markdown",
  description:
    "Convert JSON arrays and objects into clean Markdown tables for GitHub, docs, issues, and reports. Flatten nested values and preview table-ready output locally.",
  keywords: [
    "json to markdown table converter",
    "json to markdown converter",
    "json array to markdown table",
    "convert json to markdown",
    "json table generator",
    "markdown table from json",
    "github markdown table json",
    "json documentation table",
    "json data tools",
    "browser json converter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-markdown-table-converter",
  },
  openGraph: {
    title: "JSON to Markdown Table Converter | Yoryantra",
    description:
      "Turn JSON arrays and objects into clean Markdown tables for documentation, GitHub issues, READMEs, and reports.",
    url: "https://yoryantra.com/tools/json-to-markdown-table-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to Markdown Table Converter | Yoryantra",
    description:
      "Convert JSON data into Markdown tables with flattening, column cleanup, and table preview options.",
  },
};

export default function JsonToMarkdownTableConverterPage() {
  return <ToolClient />;
}
