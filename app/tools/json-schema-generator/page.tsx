import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Schema Generator | Schema from Sample JSON | Yoryantra",
  description:
    "Infer JSON Schema 2020-12, 2019-09, or Draft 7 from sample JSON with explicit required-field, array, format, null, and additional-property choices.",
  keywords: [
    "JSON Schema generator",
    "generate JSON Schema from JSON",
    "infer JSON Schema",
    "JSON Schema 2020-12",
    "JSON Schema 2019-09",
    "Draft 7 JSON Schema",
    "sample JSON schema",
    "JSON validation schema",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-schema-generator",
  },
  openGraph: {
    title: "JSON Schema Generator | Schema from Sample JSON | Yoryantra",
    description:
      "Infer a draft-aware JSON Schema from sample data while keeping required fields, arrays, nulls, formats, and object strictness explicit.",
    url: "https://yoryantra.com/tools/json-schema-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema Generator | Schema from Sample JSON | Yoryantra",
    description:
      "Infer a draft-aware JSON Schema from sample data while keeping required fields, arrays, nulls, formats, and object strictness explicit.",
  },
};

export default function JSONSchemaGeneratorPage() {
  return <ToolClient />;
}
