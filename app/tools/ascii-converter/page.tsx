import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "ASCII Converter | 0–127 Text, Decimal, Hex & Binary | Yoryantra",
  description:
    "Translate standard 7-bit ASCII values 0–127 between text, decimal, hexadecimal, byte-padded binary and octal, with control-code names and strict non-ASCII rejection.",
  alternates: {
    canonical: "https://yoryantra.com/tools/ascii-converter",
  },
  openGraph: {
    title: "ASCII Converter | Yoryantra",
    description:
      "Read standard ASCII 0–127 across decimal, hexadecimal, byte-padded binary and octal, including the named control-code range.",
    url: "https://yoryantra.com/tools/ascii-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ASCII Converter | Yoryantra",
    description:
      "Translate ASCII 0–127 between text and common numeric notations while keeping control codes and the U+007F boundary explicit.",
  },
};

export default function Page() {
  return <ToolClient />;
}
