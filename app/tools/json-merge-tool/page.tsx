import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Merge Tool | Merge Two JSON Objects Online | Yoryantra",
  description:
    "Merge two JSON objects directly in your browser. Supports shallow merge, deep merge, array handling, conflict detection, overwrite rules, clean output, reports, and JSON merge summaries.",
  keywords: [
    "JSON Merge Tool",
    "merge JSON online",
    "JSON object merger",
    "deep merge JSON",
    "JSON merge conflict checker",
    "combine JSON objects",
    "JSON data tools",
    "developer tools",
    "online JSON merger",
    "merge two JSON files",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-merge-tool",
  },
  openGraph: {
    title: "JSON Merge Tool | Merge Two JSON Objects Online | Yoryantra",
    description:
      "Merge two JSON objects directly in your browser. Supports shallow merge, deep merge, array handling, conflict detection, overwrite rules, clean output, reports, and JSON merge summaries.",
    url: "https://yoryantra.com/tools/json-merge-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Merge Tool | Merge Two JSON Objects Online | Yoryantra",
    description:
      "Merge two JSON objects directly in your browser. Supports shallow merge, deep merge, array handling, conflict detection, overwrite rules, clean output, reports, and JSON merge summaries.",
  },
};

export default function JsonMergeToolPage() {
  return <ToolClient />;
}
