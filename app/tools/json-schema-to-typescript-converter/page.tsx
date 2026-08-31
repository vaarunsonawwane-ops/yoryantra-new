import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Schema to TypeScript Converter | Yoryantra",
  description:
    "Convert common JSON Schema structures to TypeScript interfaces or type aliases, resolve local refs, handle modern tuples, and surface mapping limitations.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-schema-to-typescript-converter",
  },
  openGraph: {
    title: "JSON Schema to TypeScript Converter | Yoryantra",
    description:
      "Generate TypeScript from common JSON Schema structures and review warnings for schema rules that TypeScript cannot represent exactly.",
    url: "https://yoryantra.com/tools/json-schema-to-typescript-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Schema to TypeScript Converter | Yoryantra",
    description:
      "Convert common JSON Schema structures into TypeScript with local refs, tuples, unions, intersections, and review warnings.",
  },
};

export default function JSONSchemaToTypeScriptConverterPage() {
  return <ToolClient />;
}
