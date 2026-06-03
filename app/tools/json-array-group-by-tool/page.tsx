import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Array Group By Tool | Group and Summarize JSON Records",
  description:
    "Group JSON array records by a key, count records, summarize numeric fields, and export grouped JSON, Markdown, CSV, or checklist output locally in your browser.",
  keywords: [
    "json array group by tool",
    "json group by key",
    "group json array",
    "json array summarizer",
    "json group records",
    "json count by field",
    "json aggregate tool",
    "json data grouping",
    "json data tools",
    "browser json tool",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-array-group-by-tool",
  },
  openGraph: {
    title: "JSON Array Group By Tool | Yoryantra",
    description:
      "Group JSON array records by a selected key, count values, summarize numeric fields, and export readable reports.",
    url: "https://yoryantra.com/tools/json-array-group-by-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Array Group By Tool | Yoryantra",
    description:
      "Group JSON arrays by key, count records, summarize numeric fields, and export grouped reports locally.",
  },
};

export default function JsonArrayGroupByToolPage() {
  return <ToolClient />;
}
