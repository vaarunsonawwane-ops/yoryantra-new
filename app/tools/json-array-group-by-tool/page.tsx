import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Array Group By Tool | Typed Counts and Numeric Summaries",
  description:
    "Group JSON array records by escaped dot paths, keep value types distinct, and calculate counts, percentages, sums, averages, minimums, and maximums.",
  keywords: [
    "json array group by",
    "group json by key",
    "json group by nested field",
    "json count by field",
    "json numeric summary",
    "json aggregation",
    "json array grouping",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-array-group-by-tool",
  },
  openGraph: {
    title: "JSON Array Group By Tool | Yoryantra",
    description:
      "Group JSON records by escaped nested paths while keeping value types and numeric observations explicit.",
    url: "https://yoryantra.com/tools/json-array-group-by-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Array Group By Tool | Yoryantra",
    description:
      "Count typed JSON groups and summarize finite numeric observations without flattening away path distinctions.",
  },
};

export default function JsonArrayGroupByToolPage() {
  return <ToolClient />;
}
