import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Schema to TypeScript Converter | Interfaces & Types",
  description:
    "Convert JSON Schema to TypeScript interfaces or type aliases with local refs, enums, nullable types, objects, arrays, modern tuples, and review warnings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-schema-to-typescript-converter",
  },
  openGraph: {
    title: "JSON Schema to TypeScript Converter | Yoryantra",
    description:
      "Generate TypeScript from common JSON Schema structures and review warnings for validation rules that TypeScript cannot represent directly.",
    url: "https://yoryantra.com/tools/json-schema-to-typescript-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Schema to TypeScript Converter | Yoryantra",
    description:
      "Convert common JSON Schema structures into TypeScript and review local refs, tuples, extra keys, and unsupported validation rules.",
  },
};

export default function JSONSchemaToTypeScriptConverterPage() {
  return <ToolClient />;
}
