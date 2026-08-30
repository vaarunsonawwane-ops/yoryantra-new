import ToolClient from "./ToolClient";

export const metadata = {
  title: "YAML to JSON Converter | Multi-Document YAML | Yoryantra",
  description:
    "Convert YAML to JSON with multi-document support, JSON-compatible scalar handling, and warnings for anchors, aliases, and lossy YAML features.",
  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-to-json-converter",
  },
  openGraph: {
    title: "YAML to JSON Converter | Multi-Document YAML",
    description:
      "Convert YAML documents to readable JSON and understand which YAML features cannot be preserved in JSON.",
    url: "https://yoryantra.com/tools/yaml-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YAML to JSON Converter | Yoryantra",
    description:
      "Convert single or multi-document YAML to JSON with conversion diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
