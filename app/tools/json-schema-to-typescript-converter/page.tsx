import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Schema to TypeScript Converter | Generate Types Online | Yoryantra",
  description:
    "Convert JSON Schema to TypeScript interfaces and types. Supports objects, arrays, enums, required fields, nullable values, nested schemas, and comments directly in your browser.",
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
    title: "JSON Schema to TypeScript Converter | Generate Types Online | Yoryantra",
    description:
      "Convert JSON Schema to TypeScript interfaces and types. Supports objects, arrays, enums, required fields, nullable values, nested schemas, and comments directly in your browser.",
    url: "https://yoryantra.com/tools/json-schema-to-typescript-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema to TypeScript Converter | Generate Types Online | Yoryantra",
    description:
      "Convert JSON Schema to TypeScript interfaces and types. Supports objects, arrays, enums, required fields, nullable values, nested schemas, and comments directly in your browser.",
  },
};

export default function JSONSchemaToTypeScriptConverterPage() {
  return <ToolClient />;
}
