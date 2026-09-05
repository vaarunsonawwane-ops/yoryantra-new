import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Patch Generator | RFC 6902 Diff | Yoryantra",
  description:
    "Compare two JSON documents and derive verified RFC 6902 add, remove, and replace operations with RFC 6901 JSON Pointer paths.",
  keywords: [
    "JSON Patch generator",
    "RFC 6902",
    "JSON Pointer",
    "RFC 6901",
    "JSON patch diff",
    "generate JSON Patch",
    "JSON add remove replace",
    "application json patch",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-patch-generator",
  },
  openGraph: {
    title: "JSON Patch Generator | RFC 6902 Diff | Yoryantra",
    description:
      "Derive and verify ordered add, remove, and replace operations between two JSON documents using JSON Pointer paths.",
    url: "https://yoryantra.com/tools/json-patch-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Patch Generator | RFC 6902 Diff | Yoryantra",
    description:
      "Derive and verify ordered add, remove, and replace operations between two JSON documents using JSON Pointer paths.",
  },
};

export default function JSONPatchGeneratorPage() {
  return <ToolClient />;
}
