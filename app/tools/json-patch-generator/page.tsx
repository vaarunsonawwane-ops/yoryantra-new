import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Patch Generator | Generate JSON Patch Operations Online | Yoryantra",
  description:
    "Generate JSON Patch operations by comparing original and modified JSON. Create add, remove, and replace operations with JSON Pointer paths, summaries, reports, and clean patch output.",
  keywords: [
    "JSON Patch Generator",
    "JSON patch tool",
    "generate JSON patch",
    "JSON Patch RFC 6902",
    "JSON Pointer patch",
    "JSON diff to patch",
    "compare JSON and generate patch",
    "JSON data tools",
    "developer tools",
    "online JSON patch generator",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-patch-generator",
  },
  openGraph: {
    title: "JSON Patch Generator | Generate JSON Patch Operations Online | Yoryantra",
    description:
      "Generate JSON Patch operations by comparing original and modified JSON. Create add, remove, and replace operations with JSON Pointer paths, summaries, reports, and clean patch output.",
    url: "https://yoryantra.com/tools/json-patch-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Patch Generator | Generate JSON Patch Operations Online | Yoryantra",
    description:
      "Generate JSON Patch operations by comparing original and modified JSON. Create add, remove, and replace operations with JSON Pointer paths, summaries, reports, and clean patch output.",
  },
};

export default function JsonPatchGeneratorPage() {
  return <ToolClient />;
}
