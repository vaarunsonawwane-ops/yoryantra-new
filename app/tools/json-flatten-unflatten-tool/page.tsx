import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Flatten / Unflatten Tool | Reversible Paths | Yoryantra",
  description:
    "Flatten nested JSON into reversible escaped dot/bracket paths, or rebuild objects, arrays, empty containers, and unusual key names.",
  keywords: [
    "JSON flatten tool",
    "JSON unflatten tool",
    "flatten nested JSON",
    "unflatten JSON paths",
    "JSON dot notation",
    "JSON bracket paths",
    "nested JSON paths",
    "JSON data transformation",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-flatten-unflatten-tool",
  },
  openGraph: {
    title: "JSON Flatten / Unflatten Tool | Yoryantra",
    description:
      "Flatten nested JSON into reversible escaped paths or rebuild the original object and array structure.",
    url: "https://yoryantra.com/tools/json-flatten-unflatten-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Flatten / Unflatten Tool | Yoryantra",
    description:
      "Flatten nested JSON into reversible escaped paths or rebuild the original object and array structure.",
  },
};

export default function JSONFlattenUnflattenPage() {
  return <ToolClient />;
}
