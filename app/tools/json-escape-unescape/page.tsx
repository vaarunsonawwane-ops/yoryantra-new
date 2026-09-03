import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Escape Unescape — JSON String Literals | Yoryantra",
  description:
    "Escape plain text as one JSON string literal or decode one quoted JSON string. Covers control characters, Unicode, lone surrogates, and double escaping.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-escape-unescape",
  },
  openGraph: {
    title: "JSON Escape Unescape — JSON String Literals | Yoryantra",
    description:
      "Work with one JSON string value while keeping quotes, backslashes, control characters, Unicode, and nested serialization clear.",
    url: "https://yoryantra.com/tools/json-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Escape Unescape | Yoryantra",
    description:
      "Escape plain text into a JSON string literal or decode one quoted JSON string back to text.",
  },
};

export default function Page() {
  return <ToolClient />;
}
