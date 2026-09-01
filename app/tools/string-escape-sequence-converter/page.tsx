import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "String Escape Sequence Converter | JS, JSON & C | Yoryantra",
  description:
    "Decode, encode, normalize and inspect JavaScript, JSON, Unicode, hex and C-style escape sequences with control-character, surrogate and invalid-escape diagnostics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/string-escape-sequence-converter",
  },
  openGraph: {
    title: "String Escape Sequence Converter | Yoryantra",
    description:
      "Convert and inspect escape sequences without conflating JavaScript, JSON, Unicode and C literal rules.",
    url: "https://yoryantra.com/tools/string-escape-sequence-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "String Escape Sequence Converter | Yoryantra",
    description:
      "Decode and encode JS, JSON, Unicode, hex and C-style escapes with syntax-aware diagnostics and character inspection.",
  },
};

export default function Page() {
  return <ToolClient />;
}
