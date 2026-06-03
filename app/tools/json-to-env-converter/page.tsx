import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to ENV Converter | Convert JSON to .env Variables Online | Yoryantra",
  description:
    "Convert JSON into .env variables, flatten nested JSON keys, and generate dotenv-ready environment variables directly in your browser.",
  keywords: [
    "JSON to ENV converter",
    "JSON to .env converter",
    "JSON to dotenv",
    "convert JSON to env variables",
    "dotenv generator",
    "nested JSON to env",
    "JSON config converter",
    "environment variable generator",
    "JSON data tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-env-converter",
  },
  openGraph: {
    title: "JSON to ENV Converter | Convert JSON to .env Variables Online | Yoryantra",
    description:
      "Convert JSON into .env variables, flatten nested JSON keys, and generate dotenv-ready environment variables directly in your browser.",
    url: "https://yoryantra.com/tools/json-to-env-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to ENV Converter | Convert JSON to .env Variables Online | Yoryantra",
    description:
      "Convert JSON into .env variables, flatten nested JSON keys, and generate dotenv-ready environment variables directly in your browser.",
  },
};

export default function JSONToENVConverterPage() {
  return <ToolClient />;
}
