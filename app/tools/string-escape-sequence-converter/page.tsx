import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "String Escape Sequence Converter | JavaScript, JSON & Unicode | Yoryantra",
  description:
    "Decode, encode, inspect, and normalize JavaScript, JSON, Unicode, hex, and C-style escape sequences locally, with invalid-escape warnings and character details.",
  keywords: [
    "string escape sequence converter",
    "escape sequence decoder",
    "escape sequence encoder",
    "JavaScript string escape decoder",
    "JSON string escape converter",
    "Unicode escape decoder",
    "hex escape decoder",
    "C string escape converter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/string-escape-sequence-converter",
  },
  openGraph: {
    title: "String Escape Sequence Converter | JavaScript, JSON & Unicode | Yoryantra",
    description:
      "Decode and encode escaped strings, inspect code points, and catch invalid escape sequences without uploading the text.",
    url: "https://yoryantra.com/tools/string-escape-sequence-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "String Escape Sequence Converter | JavaScript, JSON & Unicode | Yoryantra",
    description:
      "Decode, encode, inspect, and normalize common string escape formats locally.",
  },
};

export default function StringEscapeSequenceConverterPage() {
  return <ToolClient />;
}
