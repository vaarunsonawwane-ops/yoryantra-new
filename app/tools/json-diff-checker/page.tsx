import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Diff Checker | Structural JSON Comparison | Yoryantra",
  description:
    "Compare two JSON values structurally by path, ignoring whitespace and object member order while reporting array, type, duplicate-key, and number-precision caveats.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-diff-checker",
  },
  openGraph: {
    title: "JSON Diff Checker | Structural JSON Comparison | Yoryantra",
    description:
      "Compare parsed JSON values by path and inspect added, removed, changed, and type-changed data with source-level interoperability warnings.",
    url: "https://yoryantra.com/tools/json-diff-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Diff Checker | Yoryantra",
    description:
      "Compare JSON structurally by path while ignoring whitespace and object member order.",
  },
};

export default function Page() {
  return <ToolClient />;
}
