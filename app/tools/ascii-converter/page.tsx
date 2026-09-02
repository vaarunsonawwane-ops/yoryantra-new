import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "ASCII Converter | Text, Decimal, Hex & Binary | Yoryantra",
  description:
    "Convert standard ASCII text and values from 0–127 across decimal, hexadecimal, binary and octal, inspect control-code names, and reject non-ASCII text instead of mislabelling it.",
  alternates: {
    canonical: "https://yoryantra.com/tools/ascii-converter",
  },
  openGraph: {
    title: "ASCII Converter | Yoryantra",
    description:
      "Convert and inspect true 7-bit ASCII values with mixed-notation decoding, control-character names and a complete browser-side code reference.",
    url: "https://yoryantra.com/tools/ascii-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ASCII Converter | Yoryantra",
    description:
      "Convert true ASCII 0–127 between text, decimal, hex, binary and octal while keeping control codes and non-ASCII boundaries explicit.",
  },
};

export default function Page() {
  return <ToolClient />;
}
