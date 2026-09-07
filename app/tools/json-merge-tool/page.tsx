import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Merge Tool | Deep, Shallow and Array Merge Rules",
  description:
    "Merge two JSON values with explicit deep or shallow behavior, array policies, collision handling, null rules, and path-by-path conflict reporting.",
  keywords: [
    "json merge tool",
    "merge json objects",
    "deep merge json",
    "shallow merge json",
    "json array merge",
    "json merge conflicts",
    "combine json",
    "json merge report",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-merge-tool",
  },
  openGraph: {
    title: "JSON Merge Tool | Yoryantra",
    description:
      "Combine JSON with explicit rules for nested objects, arrays, conflicting values, and right-side nulls.",
    url: "https://yoryantra.com/tools/json-merge-tool",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Merge Tool | Yoryantra",
    description:
      "Merge JSON with deliberate deep, shallow, array, collision, and null-value policies.",
  },
};

export default function JsonMergeToolPage() {
  return <ToolClient />;
}
