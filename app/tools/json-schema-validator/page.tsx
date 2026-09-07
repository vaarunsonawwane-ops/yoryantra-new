import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Schema Validator – Draft 2020-12 Subset | Yoryantra",
  description:
    "Check JSON instances against supported Draft 2020-12 rules with schema preflight checks, local references, and path-level validation failures.",
  keywords: [
    "json schema validator",
    "draft 2020-12 validator",
    "validate json against schema",
    "json schema validation",
    "json schema required properties",
    "json schema array validation",
    "json schema ref validator",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-schema-validator",
  },
  openGraph: {
    title: "JSON Schema Validator – Draft 2020-12 Subset | Yoryantra",
    description:
      "Check JSON instances against a documented Draft 2020-12 subset with path-level failures and schema preflight checks.",
    url: "https://yoryantra.com/tools/json-schema-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema Validator – Draft 2020-12 Subset | Yoryantra",
    description:
      "Validate JSON against supported Draft 2020-12 assertions without hiding unsupported schema features.",
  },
};

export default function Page() {
  return <ToolClient />;
}
