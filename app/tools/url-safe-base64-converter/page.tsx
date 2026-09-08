import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Safe Base64 Converter | Base64URL Validation | Yoryantra",
  description:
    "Convert standard Base64, Base64URL, and text with strict alphabet, padding, canonical pad-bit, and UTF-8 validation.",
  keywords: [
    "URL Safe Base64 Converter",
    "Base64URL",
    "Base64 URL safe encoder",
    "Base64URL decoder",
    "Base64 to Base64URL",
    "Base64URL padding",
    "RFC 4648",
    "Base64URL validation",
    "encoding tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/url-safe-base64-converter",
  },
  openGraph: {
    title: "URL Safe Base64 Converter | Base64URL Validation | Yoryantra",
    description:
      "Convert standard Base64, Base64URL, and text with strict alphabet, padding, canonical pad-bit, and UTF-8 validation.",
    url: "https://yoryantra.com/tools/url-safe-base64-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Safe Base64 Converter | Base64URL Validation | Yoryantra",
    description:
      "Convert standard Base64, Base64URL, and text with strict alphabet, padding, canonical pad-bit, and UTF-8 validation.",
  },
};

export default function UrlSafeBase64ConverterPage() {
  return <ToolClient />;
}
