import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "YAML Validator | Syntax & Parser Diagnostics | Yoryantra",
  description:
    "Validate YAML syntax with line/column diagnostics, multi-document support, duplicate-key checks, and warnings for aliases, tabs, templates, and versions.",
  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-validator",
  },
  openGraph: {
    title: "YAML Validator | Syntax & Parser Diagnostics | Yoryantra",
    description:
      "Check YAML syntax with a real parser and understand the difference between valid YAML and valid application configuration.",
    url: "https://yoryantra.com/tools/yaml-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "YAML Validator | Yoryantra",
    description:
      "Validate YAML syntax, multi-document streams, parser errors, anchors, aliases, and schema-sensitive values.",
  },
};

export default function Page() {
  return <ToolClient />;
}
