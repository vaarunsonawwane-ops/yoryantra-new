import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Unicode Escape Sequence Converter | Convert Unicode Escapes Online | Yoryantra",
  description:
    "Convert Unicode escape sequences like \\uXXXX, \\u{1F600}, \\xXX, HTML entities, and plain text directly in your browser.",
  keywords: [
    "Unicode escape sequence converter",
    "Unicode escape decoder",
    "Unicode escape encoder",
    "convert unicode escapes",
    "\\uXXXX decoder",
    "\\u{1F600} converter",
    "JavaScript unicode escape decoder",
    "Unicode to text converter",
    "Encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/unicode-escape-sequence-converter",
  },
  openGraph: {
    title: "Unicode Escape Sequence Converter | Convert Unicode Escapes Online | Yoryantra",
    description:
      "Convert Unicode escape sequences like \\uXXXX, \\u{1F600}, \\xXX, HTML entities, and plain text directly in your browser.",
    url: "https://yoryantra.com/tools/unicode-escape-sequence-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unicode Escape Sequence Converter | Convert Unicode Escapes Online | Yoryantra",
    description:
      "Convert Unicode escape sequences like \\uXXXX, \\u{1F600}, \\xXX, HTML entities, and plain text directly in your browser.",
  },
};

export default function UnicodeEscapeSequenceConverterPage() {
  return <ToolClient />;
}
