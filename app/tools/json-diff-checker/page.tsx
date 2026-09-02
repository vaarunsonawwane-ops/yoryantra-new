import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Diff Checker | Structural JSON Comparison | Yoryantra",
  description:
    "Compare two JSON values structurally by JSON Pointer path. Ignore formatting and object member order while detecting added, removed, changed, and type-changed data.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-diff-checker",
  },
  openGraph: {
    title: "JSON Diff Checker | Structural JSON Comparison | Yoryantra",
    description:
      "Compare JSON structurally with path-based differences, order-sensitive arrays, exact number handling, and duplicate-member warnings.",
    url: "https://yoryantra.com/tools/json-diff-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Diff Checker | Yoryantra",
    description:
      "Find structural JSON differences by path without formatting or object-order noise.",
  },
};

export default function Page() {
  return <ToolClient />;
}
