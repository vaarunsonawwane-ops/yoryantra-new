import ToolClient from "./ToolClient";

export const metadata = {
  title: "YAML Validator | Syntax, Documents & Duplicate Keys | Yoryantra",
  description:
    "Validate YAML syntax with a real YAML parser, inspect multiple documents, and surface duplicate-key, alias, and parser diagnostics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-validator",
  },
  openGraph: {
    title: "YAML Validator | Syntax, Documents & Duplicate Keys",
    description:
      "Check YAML syntax and multi-document streams locally with parser line and column diagnostics.",
    url: "https://yoryantra.com/tools/yaml-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YAML Validator | Yoryantra",
    description:
      "Validate YAML syntax and inspect multi-document parser diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
