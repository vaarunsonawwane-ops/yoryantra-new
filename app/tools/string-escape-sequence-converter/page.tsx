import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "String Escape Sequence Converter | JavaScript, JSON & C | Yoryantra",
  description:
    "Decode, encode and inspect JavaScript, JSON and C string escapes, including Unicode, hex, control characters, surrogate pairs, malformed escapes and C-specific numeric rules.",
  alternates: {
    canonical: "https://yoryantra.com/tools/string-escape-sequence-converter",
  },
  openGraph: {
    title: "String Escape Sequence Converter | Yoryantra",
    description:
      "Compare JavaScript, JSON and C escape rules while keeping Unicode, control-character and surrogate edge cases visible.",
    url: "https://yoryantra.com/tools/string-escape-sequence-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "String Escape Sequence Converter | Yoryantra",
    description:
      "Decode and encode JavaScript, JSON and C escapes with syntax-aware diagnostics, Unicode inspection and control-character checks.",
  },
};

export default function Page() {
  return <ToolClient />;
}
