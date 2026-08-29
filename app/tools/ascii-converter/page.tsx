import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "ASCII Converter – Text to ASCII & ASCII to Text | Yoryantra",
  description:
    "Convert text to ASCII values and decode decimal, hex, or binary ASCII codes from 0–127. Non-ASCII characters are identified instead of mislabelled.",
  alternates: {
    canonical: "https://yoryantra.com/tools/ascii-converter",
  },
  openGraph: {
    title: "ASCII Converter – Text to ASCII & ASCII to Text | Yoryantra",
    description:
      "Convert text to standard ASCII values and decode decimal, hexadecimal, or binary ASCII codes from 0–127 in your browser.",
    url: "https://yoryantra.com/tools/ascii-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASCII Converter – Text to ASCII & ASCII to Text | Yoryantra",
    description:
      "Convert text to ASCII values or decode decimal, hex, and binary ASCII codes from 0–127.",
  },
};

export default function Page() {
  return <ToolClient />;
}
