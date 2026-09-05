import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "ENV to JSON Converter | Parse .env to JSON | Yoryantra",
  description:
    "Parse dotenv-style assignments into flat or nested JSON with comment handling, export prefixes, conservative type inference, and collision detection.",
  keywords: [
    "ENV to JSON converter",
    ".env to JSON",
    "dotenv parser",
    "environment variables to JSON",
    "dotenv to JSON",
    "parse env file",
    "nested env keys",
    "JSON configuration",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/env-to-json-converter",
  },
  openGraph: {
    title: "ENV to JSON Converter | Parse .env to JSON | Yoryantra",
    description:
      "Parse dotenv-style assignments into flat or nested JSON with explicit type inference and collision checks.",
    url: "https://yoryantra.com/tools/env-to-json-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ENV to JSON Converter | Parse .env to JSON | Yoryantra",
    description:
      "Parse dotenv-style assignments into flat or nested JSON with explicit type inference and collision checks.",
  },
};

export default function ENVToJSONConverterPage() {
  return <ToolClient />;
}
