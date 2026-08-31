import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "YAML Formatter | Format YAML Documents | Yoryantra",
  description:
    "Format YAML with parser-backed syntax diagnostics, multi-document support, configurable indentation, and comment-aware document handling.",
  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-formatter",
  },
  openGraph: {
    title: "YAML Formatter | Yoryantra",
    description:
      "Format YAML documents and inspect parser warnings without pretending formatting is Kubernetes or application-schema validation.",
    url: "https://yoryantra.com/tools/yaml-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YAML Formatter | Yoryantra",
    description:
      "Format YAML locally with multi-document and parser diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
