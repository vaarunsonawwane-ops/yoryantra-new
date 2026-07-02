import ToolClient from "./ToolClient";

export const metadata = {
  title: "HMAC SHA-256, SHA-384 and SHA-512 Generator | Yoryantra",

  description:
    "Generate HMAC SHA-256, SHA-384, or SHA-512 values from UTF-8 text and a shared secret directly in your browser.",

  keywords: [
    "hmac generator",
    "hmac sha256 generator",
    "hmac sha512 generator",
    "generate hmac",
    "api signature generator",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/hmac-generator",
  },

  openGraph: {
    title: "HMAC SHA-256, SHA-384 and SHA-512 Generator | Yoryantra",
    description:
      "Generate HMAC SHA-256, SHA-384, or SHA-512 values from UTF-8 text and a shared secret in your browser.",
    url: "https://yoryantra.com/tools/hmac-generator",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "HMAC SHA-256, SHA-384 and SHA-512 Generator | Yoryantra",
    description:
      "Generate HMAC SHA-256, SHA-384, or SHA-512 values locally from UTF-8 text."
  },
};

export default function Page() {
  return <ToolClient />;
}