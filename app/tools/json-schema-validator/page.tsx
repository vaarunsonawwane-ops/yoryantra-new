import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Schema Validator for Common Validation Rules | Yoryantra",

  description:
    "Validate JSON data against common JSON Schema rules including types, required fields, properties, arrays, enums, ranges, and patterns.",

  keywords: [
    "json schema validator",
    "validate json schema",
    "json schema checker",
    "json validator schema",
    "json structure validator",
    "api json validator",
    "developer json tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/json-schema-validator",
  },

  openGraph: {
    title:
      "JSON Schema Validator for Common Validation Rules | Yoryantra",

    description:
      "Validate JSON against common schema rules directly in your browser.",

    url:
      "https://yoryantra.com/tools/json-schema-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JSON Schema Validator for Common Validation Rules | Yoryantra",

    description:
      "Check JSON against common schema rules in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}