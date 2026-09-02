import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Array Filter Tool | Nested Record Filters | Yoryantra",
  description:
    "Filter JSON arrays by nested field paths, text, numbers, booleans, regex, existence, or ranges while preserving source records and type distinctions.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-array-filter-tool",
  },
  openGraph: {
    title: "JSON Array Filter Tool | Yoryantra",
    description:
      "Filter arrays of JSON records by nested field paths and conditions, inspect match reasons and keep diagnostic metadata separate from original objects.",
    url: "https://yoryantra.com/tools/json-array-filter-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Array Filter Tool | Yoryantra",
    description:
      "Filter JSON array records by nested field, text, number, boolean, regex, range or existence checks locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
