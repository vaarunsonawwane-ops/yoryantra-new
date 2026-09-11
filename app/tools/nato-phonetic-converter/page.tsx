import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "NATO Phonetic Alphabet Converter | ICAO Spelling Words",
  description:
    "Convert A–Z letters to official NATO/ICAO spelling words, choose written or radiotelephony forms for digits, and preserve unsupported Unicode characters.",
  alternates: {
    canonical: "https://yoryantra.com/tools/nato-phonetic-converter",
  },
  openGraph: {
    title: "NATO Phonetic Alphabet Converter | Yoryantra",
    description:
      "Spell letters with the official Alfa–Zulu code words and choose standard written or radiotelephony digit forms.",
    url: "https://yoryantra.com/tools/nato-phonetic-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NATO Phonetic Alphabet Converter | Yoryantra",
    description:
      "Convert letters to NATO/ICAO code words with optional radiotelephony pronunciations for digits.",
  },
};

export default function NatoPhoneticConverterPage() {
  return <ToolClient />;
}
