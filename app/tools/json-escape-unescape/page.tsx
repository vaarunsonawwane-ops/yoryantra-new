import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Escape Unescape | JSON String Escaper | Yoryantra",
  description:
    "Escape raw text as JSON string syntax or decode JSON string literals and escaped contents with strict JSON parsing, Unicode handling, and double-escaping guidance.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-escape-unescape",
  },
  openGraph: {
    title: "JSON Escape Unescape | JSON String Escaper | Yoryantra",
    description:
      "Escape text for a JSON string or decode quoted JSON string literals and escaped contents directly in your browser.",
    url: "https://yoryantra.com/tools/json-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Escape Unescape | Yoryantra",
    description:
      "Escape and unescape JSON string syntax with quoted-literal and contents-only modes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
