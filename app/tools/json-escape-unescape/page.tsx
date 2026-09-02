import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON Escape Unescape — JSON String Literal Tool | Yoryantra",
  description:
    "Escape plain text as a JSON string literal or unescape one JSON string value. Handle quotes, backslashes, control characters, Unicode, and double escaping.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-escape-unescape",
  },
  openGraph: {
    title: "JSON Escape Unescape — JSON String Literal Tool | Yoryantra",
    description:
      "Create or decode JSON string literals with clear handling of quotes, backslashes, control characters, Unicode, and nested serialization.",
    url: "https://yoryantra.com/tools/json-escape-unescape",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Escape Unescape | Yoryantra",
    description: "Escape plain text as a JSON string literal or decode a valid JSON string literal back to text.",
  },
};

export default function Page() {
  return <ToolClient />;
}
