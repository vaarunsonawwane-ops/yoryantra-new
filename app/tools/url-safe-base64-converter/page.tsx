import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Safe Base64 Converter | Base64URL Encode Decode Online | Yoryantra",
  description:
    "Convert between Base64 and URL-safe Base64. Encode text to Base64URL, decode Base64URL to text, add or remove padding, and validate web-safe tokens.",
  keywords: [
    "URL Safe Base64 Converter",
    "Base64URL converter",
    "Base64 URL safe encoder",
    "Base64URL decoder",
    "Base64 to Base64URL",
    "Base64URL to Base64",
    "JWT Base64URL decoder",
    "URL safe encoding",
    "encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/url-safe-base64-converter",
  },
  openGraph: {
    title: "URL Safe Base64 Converter | Base64URL Encode Decode Online | Yoryantra",
    description:
      "Convert between Base64 and URL-safe Base64. Encode text to Base64URL, decode Base64URL to text, add or remove padding, and validate web-safe tokens.",
    url: "https://yoryantra.com/tools/url-safe-base64-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Safe Base64 Converter | Base64URL Encode Decode Online | Yoryantra",
    description:
      "Convert between Base64 and URL-safe Base64. Encode text to Base64URL, decode Base64URL to text, add or remove padding, and validate web-safe tokens.",
  },
};

export default function UrlSafeBase64ConverterPage() {
  return <ToolClient />;
}
