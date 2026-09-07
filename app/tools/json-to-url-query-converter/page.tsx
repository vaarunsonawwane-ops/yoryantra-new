import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to URL Query Converter | Encoding, Arrays and Nested Keys",
  description:
    "Translate JSON objects and query strings with explicit nested-key, array, form-encoding, null, boolean, repetition, and type-coercion choices.",
  keywords: [
    "json to query string",
    "query string to json",
    "json url parameters",
    "url query converter",
    "nested query parameters",
    "urlsearchparams encoding",
    "form urlencoded query",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-url-query-converter",
  },
  openGraph: {
    title: "JSON to URL Query Converter | Yoryantra",
    description:
      "Translate JSON and query parameters while keeping encoding, nested-key conventions, repeated names, and type conversion visible.",
    url: "https://yoryantra.com/tools/json-to-url-query-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to URL Query Converter | Yoryantra",
    description:
      "Build or decode query strings without hiding form encoding, array policies, or string-to-type coercion.",
  },
};

export default function JsonToUrlQueryConverterPage() {
  return <ToolClient />;
}
