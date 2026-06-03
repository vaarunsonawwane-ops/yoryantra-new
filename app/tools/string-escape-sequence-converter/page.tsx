import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "String Escape Sequence Converter | Decode and Encode Escaped Text | Yoryantra",
  description:
    "Decode and encode string escape sequences for JavaScript, JSON, Unicode, hex, and C-style text. Convert escaped strings, inspect characters, and format output locally.",
  keywords: [
    "String Escape Sequence Converter",
    "escape sequence decoder",
    "escape sequence encoder",
    "JavaScript string escape decoder",
    "JSON string escape converter",
    "Unicode escape decoder",
    "hex escape decoder",
    "C string escape decoder",
    "encoding tools",
    "developer encoding tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/string-escape-sequence-converter",
  },
  openGraph: {
    title: "String Escape Sequence Converter | Decode and Encode Escaped Text | Yoryantra",
    description:
      "Decode and encode string escape sequences for JavaScript, JSON, Unicode, hex, and C-style text. Convert escaped strings, inspect characters, and format output locally.",
    url: "https://yoryantra.com/tools/string-escape-sequence-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "String Escape Sequence Converter | Decode and Encode Escaped Text | Yoryantra",
    description:
      "Decode and encode string escape sequences for JavaScript, JSON, Unicode, hex, and C-style text. Convert escaped strings, inspect characters, and format output locally.",
  },
};

export default function StringEscapeSequenceConverterPage() {
  return <ToolClient />;
}
