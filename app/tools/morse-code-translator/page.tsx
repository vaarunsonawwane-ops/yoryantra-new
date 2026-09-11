import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Morse Code Translator | Text and International Morse",
  description:
    "Translate text to International Morse notation or decode dots and dashes, with ITU character boundaries, spacing guidance, and optional software extensions.",
  alternates: {
    canonical: "https://yoryantra.com/tools/morse-code-translator",
  },
  openGraph: {
    title: "Morse Code Translator | Yoryantra",
    description:
      "Translate International Morse letters, digits, and supported symbols between text and dot-dash notation.",
    url: "https://yoryantra.com/tools/morse-code-translator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Morse Code Translator | Yoryantra",
    description:
      "Translate text and International Morse notation with explicit spacing and extension boundaries.",
  },
};

export default function MorseCodeTranslatorPage() {
  return <ToolClient />;
}
