import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Punycode Converter | Unicode and xn-- IDN Labels | Yoryantra",
  description: "Convert internationalized hostnames between Unicode and ASCII form, inspect xn-- labels, and flag IDNA or mixed-script concerns.",
  alternates: { canonical: "https://yoryantra.com/tools/punycode-converter" },
  openGraph: { title: "Punycode Converter | Yoryantra", description: "Convert internationalized hostnames between Unicode and ASCII form while keeping IDNA and raw Punycode boundaries clear.", url: "https://yoryantra.com/tools/punycode-converter", siteName: "Yoryantra", type: "website" },
  twitter: { card: "summary", title: "Punycode Converter | Yoryantra", description: "Convert Unicode hostnames and xn-- labels with IDNA-aware validation." },
};

export default function PunycodeConverterPage() { return <ToolClient />; }
