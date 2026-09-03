import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Diff Checker | Compare JSON by Path | Yoryantra",
  description:
    "Compare two JSON documents by JSON Pointer path, ignoring formatting and object order while preserving array order, exact numbers, and duplicate-name warnings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-diff-checker",
  },
  openGraph: {
    title: "JSON Diff Checker | Compare JSON by Path | Yoryantra",
    description:
      "Compare JSON by path with order-sensitive arrays, exact decimal-number comparison, duplicate-name warnings, and clear added, removed, changed, or type-changed results.",
    url: "https://yoryantra.com/tools/json-diff-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Diff Checker | Yoryantra",
    description:
      "Compare parsed JSON values by path without treating formatting or object-member order as data changes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
