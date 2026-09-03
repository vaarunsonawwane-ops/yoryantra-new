import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "YAML to JSON Converter | Loss Checks | Yoryantra",
  description:
    "Convert YAML to JSON with multi-document handling and warnings for anchors, aliases, complex keys, scalar resolution, and conversion loss.",
  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-to-json-converter",
  },
  openGraph: {
    title: "YAML to JSON Converter | Loss Checks | Yoryantra",
    description:
      "Convert YAML streams to JSON and see which YAML features cannot survive the conversion exactly.",
    url: "https://yoryantra.com/tools/yaml-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "YAML to JSON Converter | Yoryantra",
    description:
      "Convert YAML to JSON with multi-document handling and YAML-to-JSON loss diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
