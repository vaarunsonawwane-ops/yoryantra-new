import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "ENV to JSON Converter | Convert .env Variables to JSON Online | Yoryantra",
  description:
    "Convert .env variables into JSON, parse dotenv key-value pairs, nest environment keys, and format clean JSON directly in your browser.",
  keywords: [
    "ENV to JSON converter",
    ".env to JSON converter",
    "dotenv to JSON",
    "convert env to JSON",
    "environment variables to JSON",
    "env file converter",
    "dotenv parser",
    "JSON config converter",
    "JSON data tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/env-to-json-converter",
  },
  openGraph: {
    title: "ENV to JSON Converter | Convert .env Variables to JSON Online | Yoryantra",
    description:
      "Convert .env variables into JSON, parse dotenv key-value pairs, nest environment keys, and format clean JSON directly in your browser.",
    url: "https://yoryantra.com/tools/env-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ENV to JSON Converter | Convert .env Variables to JSON Online | Yoryantra",
    description:
      "Convert .env variables into JSON, parse dotenv key-value pairs, nest environment keys, and format clean JSON directly in your browser.",
  },
};

export default function ENVToJSONConverterPage() {
  return <ToolClient />;
}
