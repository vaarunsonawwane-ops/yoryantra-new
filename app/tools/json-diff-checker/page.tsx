import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Diff Checker | Compare JSON by Path | Yoryantra",
  description:
    "Compare two JSON values structurally by path. Ignore object key order and whitespace while finding added, removed, changed, and type-changed data.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-diff-checker",
  },
  openGraph: {
    title: "JSON Diff Checker | Compare JSON by Path | Yoryantra",
    description:
      "Compare JSON structurally and inspect added, removed, changed, and type-changed values without line-based false differences.",
    url: "https://yoryantra.com/tools/json-diff-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Diff Checker | Compare JSON by Path | Yoryantra",
    description:
      "Compare JSON structurally by path while ignoring whitespace and object key order.",
  },
};

export default function Page() {
  return <ToolClient />;
}
