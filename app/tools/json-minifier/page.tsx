import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Minifier Online | Minify, Compress, and Validate JSON",
  description:
    "Minify JSON online, compress JSON payloads, remove whitespace, validate JSON syntax, and copy clean compact JSON for APIs, apps, logs, and development workflows.",
  keywords: [
    "json minifier",
    "json minifier online",
    "minify json",
    "minify json online",
    "json minify",
    "json minify online",
    "json compressor",
    "compress json online",
    "remove whitespace from json",
    "compact json",
    "json validator",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-minifier",
  },
  openGraph: {
    title: "JSON Minifier Online | Yoryantra",
    description:
      "Minify JSON, remove whitespace, validate syntax, and create compact JSON directly in your browser.",
    url: "https://yoryantra.com/tools/json-minifier",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Minifier Online | Yoryantra",
    description:
      "Compress JSON online, validate syntax, and copy compact JSON for APIs and development work.",
  },
};

export default function JsonMinifierPage() {
  return <ToolClient />;
}
