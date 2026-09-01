import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to FormData Converter | Form Encoding | Yoryantra",
  description:
    "Convert JSON objects into FormData calls, multipart field previews, URL-encoded bodies, cURL form flags and flattened fields with explicit array/null rules.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-form-data-converter",
  },
  openGraph: {
    title: "JSON to FormData Converter | Yoryantra",
    description:
      "Flatten JSON deliberately for FormData, multipart/form-data and application/x-www-form-urlencoded workflows without guessing how nested data should map.",
    url: "https://yoryantra.com/tools/json-to-form-data-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to FormData Converter | Yoryantra",
    description:
      "Convert JSON into FormData, multipart, URL-encoded and cURL field representations with nested-data warnings.",
  },
};

export default function Page() {
  return <ToolClient />;
}
