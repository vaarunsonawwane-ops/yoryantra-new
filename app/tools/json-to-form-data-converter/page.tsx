import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to Form Data Converter | Convert JSON to Form Fields",
  description:
    "Convert JSON objects into form-data style fields, URL encoded form bodies, flat key-value pairs, and cURL-ready form parameters locally in your browser.",
  keywords: [
    "json to form data converter",
    "json to formdata converter",
    "json to form fields",
    "json to x-www-form-urlencoded",
    "json to url encoded form",
    "json to multipart form data",
    "form data generator",
    "api form data converter",
    "postman form data json",
    "json data tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-form-data-converter",
  },
  openGraph: {
    title: "JSON to Form Data Converter | Yoryantra",
    description:
      "Turn JSON objects into flat form fields, URL encoded bodies, multipart-style pairs, and cURL form parameters for API debugging.",
    url: "https://yoryantra.com/tools/json-to-form-data-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to Form Data Converter | Yoryantra",
    description:
      "Convert JSON into form-data fields, x-www-form-urlencoded strings, cURL parameters, and key-value output.",
  },
};

export default function JsonToFormDataConverterPage() {
  return <ToolClient />;
}
