import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSONPath Tester | RFC 9535 Result Paths | Yoryantra",
  description:
    "Test a practical RFC 9535 JSONPath subset, inspect ordered node matches and normalized result paths, and understand indices, slices, descendants, unions, and filters.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-path-tester",
  },
  openGraph: {
    title: "JSONPath Tester | Yoryantra",
    description:
      "Run JSONPath queries against JSON and inspect exact node locations, selector behavior, empty results, duplicate selections, slices, descendants, and filter boundaries.",
    url: "https://yoryantra.com/tools/json-path-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSONPath Tester | Yoryantra",
    description:
      "Test JSONPath queries with normalized result paths and clear RFC 9535 scope notes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
