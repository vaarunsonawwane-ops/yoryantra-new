import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Pointer Evaluator | RFC 6901 Paths and URI Fragments",
  description:
    "Resolve RFC 6901 JSON Pointer paths, decode escaped tokens and URI-fragment forms, test array indexes, and generate exact pointers from JSON.",
  keywords: [
    "json pointer evaluator",
    "rfc 6901",
    "json pointer path",
    "json pointer decoder",
    "json pointer uri fragment",
    "json pointer array index",
    "generate json pointers",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-pointer-evaluator",
  },
  openGraph: {
    title: "JSON Pointer Evaluator | Yoryantra",
    description:
      "Resolve RFC 6901 pointers precisely, including root pointers, escaped member names, arrays, and URI-fragment representation.",
    url: "https://yoryantra.com/tools/json-pointer-evaluator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Pointer Evaluator | Yoryantra",
    description:
      "Check exact RFC 6901 paths and decode pointer tokens without confusing JSON Pointer with JSONPath.",
  },
};

export default function JsonPointerEvaluatorPage() {
  return <ToolClient />;
}
