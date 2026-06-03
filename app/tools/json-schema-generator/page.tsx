import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Schema Generator | Generate Schema From JSON Online | Yoryantra",
  description:
    "Generate JSON Schema from sample JSON, detect types, arrays, nested objects, required fields, enums, examples, and validation-friendly schema directly in your browser.",
  keywords: [
    "JSON Schema generator",
    "generate JSON Schema",
    "JSON to schema",
    "JSON Schema from JSON",
    "create JSON Schema online",
    "sample JSON to JSON Schema",
    "JSON schema builder",
    "JSON tools",
    "data tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-schema-generator",
  },
  openGraph: {
    title: "JSON Schema Generator | Generate Schema From JSON Online | Yoryantra",
    description:
      "Generate JSON Schema from sample JSON, detect types, arrays, nested objects, required fields, enums, examples, and validation-friendly schema directly in your browser.",
    url: "https://yoryantra.com/tools/json-schema-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema Generator | Generate Schema From JSON Online | Yoryantra",
    description:
      "Generate JSON Schema from sample JSON, detect types, arrays, nested objects, required fields, enums, examples, and validation-friendly schema directly in your browser.",
  },
};

export default function JSONSchemaGeneratorPage() {
  return <ToolClient />;
}
