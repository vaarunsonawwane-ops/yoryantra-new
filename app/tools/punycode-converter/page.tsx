import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Punycode Converter | Convert IDN Domains to xn-- Punycode | Yoryantra",
  description:
    "Convert international domain names between Unicode and Punycode. Encode IDN domains to xn-- format, decode Punycode domains, inspect labels, and copy clean output in your browser.",
  keywords: [
    "Punycode Converter",
    "IDN converter",
    "convert domain to punycode",
    "punycode decoder",
    "punycode encoder",
    "xn-- converter",
    "international domain name converter",
    "unicode domain converter",
    "encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/punycode-converter",
  },
  openGraph: {
    title: "Punycode Converter | Convert IDN Domains to xn-- Punycode | Yoryantra",
    description:
      "Convert international domain names between Unicode and Punycode. Encode IDN domains to xn-- format, decode Punycode domains, inspect labels, and copy clean output in your browser.",
    url: "https://yoryantra.com/tools/punycode-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Punycode Converter | Convert IDN Domains to xn-- Punycode | Yoryantra",
    description:
      "Convert international domain names between Unicode and Punycode. Encode IDN domains to xn-- format, decode Punycode domains, inspect labels, and copy clean output in your browser.",
  },
};

export default function PunycodeConverterPage() {
  return <ToolClient />;
}
