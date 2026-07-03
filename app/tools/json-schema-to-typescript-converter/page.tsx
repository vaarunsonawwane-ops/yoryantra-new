import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Schema to TypeScript Converter | Yoryantra",
  description:
    "Convert common JSON Schema structures into TypeScript interfaces or type aliases. Review warnings for references, composition, tuples, and validation rules that TypeScript cannot represent.",
  keywords: [
    "JSON Schema to TypeScript",
    "JSON Schema TypeScript converter",
    "convert JSON Schema to TypeScript",
    "JSON Schema to interface",
    "generate TypeScript from JSON Schema",
    "JSON Schema types generator",
    "TypeScript interface generator",
    "JSON tools",
    "data tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-schema-to-typescript-converter",
  },
  openGraph: {
    title: "JSON Schema to TypeScript Converter | Yoryantra",
    description:
      "Convert common JSON Schema structures into TypeScript interfaces or type aliases. Review warnings for references, composition, tuples, and validation rules that TypeScript cannot represent.",
    url: "https://yoryantra.com/tools/json-schema-to-typescript-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema to TypeScript Converter | Yoryantra",
    description:
      "Convert common JSON Schema structures into TypeScript interfaces or type aliases. Review warnings for references, composition, tuples, and validation rules that TypeScript cannot represent.",
  },
};

export default function JSONSchemaToTypeScriptConverterPage() {
  return <ToolClient />;
}
