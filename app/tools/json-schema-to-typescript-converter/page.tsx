import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Schema to TypeScript Converter | Interfaces & Types",
  description:
    "Convert JSON Schema to TypeScript interfaces or type aliases in your browser. Handles local refs and Draft 2020-12 tuples with warnings for runtime-only rules.",
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
      "Generate TypeScript from JSON Schema with local-reference handling, tuple support, and explicit warnings where static types cannot reproduce runtime validation.",
    url: "https://yoryantra.com/tools/json-schema-to-typescript-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Schema to TypeScript Converter | Yoryantra",
    description:
      "Generate TypeScript from JSON Schema with local-reference handling, tuple support, and explicit warnings where static types cannot reproduce runtime validation.",
  },
};

export default function JSONSchemaToTypeScriptConverterPage() {
  return <ToolClient />;
}
