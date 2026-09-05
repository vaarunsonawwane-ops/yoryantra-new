import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to ENV Converter | JSON Config to .env | Yoryantra",
  description:
    "Flatten JSON configuration into .env assignments with key normalization, array and null policies, quoting safeguards, and collision detection.",
  keywords: [
    "JSON to ENV converter",
    "JSON to .env",
    "JSON to dotenv",
    "environment variable generator",
    "flatten JSON config",
    "JSON config to environment variables",
    "dotenv generator",
    "nested JSON to ENV",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-env-converter",
  },
  openGraph: {
    title: "JSON to ENV Converter | JSON Config to .env | Yoryantra",
    description:
      "Flatten JSON configuration into .env assignments with explicit array, null, quoting, and key-normalization choices.",
    url: "https://yoryantra.com/tools/json-to-env-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to ENV Converter | JSON Config to .env | Yoryantra",
    description:
      "Flatten JSON configuration into .env assignments with explicit array, null, quoting, and key-normalization choices.",
  },
};

export default function JSONToENVConverterPage() {
  return <ToolClient />;
}
