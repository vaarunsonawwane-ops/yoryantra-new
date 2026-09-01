import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to YAML Converter | Precision Checks | Yoryantra",
  description:
    "Convert JSON to readable YAML with formatting controls, duplicate-key diagnostics, and warnings for JavaScript number precision and conversion loss.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-yaml-converter",
  },
  openGraph: {
    title: "JSON to YAML Converter | Precision Checks | Yoryantra",
    description:
      "Convert valid JSON to YAML while keeping number precision, duplicate object names, string quoting, and presentation choices visible.",
    url: "https://yoryantra.com/tools/json-to-yaml-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to YAML Converter | Yoryantra",
    description:
      "Convert JSON to YAML with practical formatting controls and conversion-loss diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
