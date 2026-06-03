import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Pointer Evaluator | Test RFC 6901 JSON Pointers",
  description:
    "Evaluate JSON Pointer paths against pasted JSON, inspect matched values, decode escaped pointer segments, and create pointer reports locally in your browser.",
  keywords: [
    "json pointer evaluator",
    "json pointer tester",
    "json pointer tool",
    "rfc 6901 json pointer",
    "test json pointer",
    "json pointer path",
    "json pointer decoder",
    "json patch pointer",
    "openapi json pointer",
    "json data tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-pointer-evaluator",
  },
  openGraph: {
    title: "JSON Pointer Evaluator | Yoryantra",
    description:
      "Test JSON Pointer paths like /user/name/0 against JSON, inspect matches, and decode pointer segments without uploading data.",
    url: "https://yoryantra.com/tools/json-pointer-evaluator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Pointer Evaluator | Yoryantra",
    description:
      "Evaluate RFC 6901 JSON Pointers, inspect matched values, and create JSON Pointer reports locally.",
  },
};

export default function JsonPointerEvaluatorPage() {
  return <ToolClient />;
}
