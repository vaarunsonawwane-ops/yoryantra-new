import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to FormData Converter | FormData, URL Encoded & cURL | Yoryantra",
  description:
    "Convert JSON into JavaScript FormData code, form fields, x-www-form-urlencoded bodies, multipart previews, and safe cURL form parameters in your browser.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-form-data-converter",
  },
  openGraph: {
    title: "JSON to FormData Converter | Yoryantra",
    description:
      "Turn JSON into JavaScript FormData calls, URL encoded form bodies, cURL form parameters, and flattened form fields.",
    url: "https://yoryantra.com/tools/json-to-form-data-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to FormData Converter | Yoryantra",
    description:
      "Convert JSON into FormData code, form fields, URL encoded bodies, multipart previews, and cURL form parameters.",
  },
};

export default function JsonToFormDataConverterPage() {
  return <ToolClient />;
}
