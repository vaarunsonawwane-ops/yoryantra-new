import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to FormData Converter | Nested Fields & Arrays | Yoryantra",
  description:
    "Convert a JSON object into FormData code, URL-encoded fields, cURL form fields or multipart previews with explicit rules for nesting, arrays and null values.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-form-data-converter",
  },
  openGraph: {
    title: "JSON to FormData Converter | Yoryantra",
    description:
      "Map JSON objects, arrays, nulls and scalar values into explicit form field representations without hiding the flattening convention.",
    url: "https://yoryantra.com/tools/json-to-form-data-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to FormData Converter | Yoryantra",
    description:
      "Generate FormData, URL-encoded, cURL and multipart field representations from JSON with clear nesting and array rules.",
  },
};

export default function Page() {
  return <ToolClient />;
}
