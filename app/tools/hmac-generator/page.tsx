import ToolClient from "./ToolClient";

export const metadata = {
  title: "HMAC Generator Online Free | Yoryantra",

  description:
    "Generate HMAC signatures instantly with this free online HMAC Generator. Create HMAC SHA-256, SHA-384, and SHA-512 signatures for APIs and security workflows.",

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
    title: "HMAC Generator Online Free | Yoryantra",
    description:
      "Generate HMAC signatures instantly with this free online HMAC Generator.",
    url: "https://yoryantra.com/tools/hmac-generator",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "HMAC Generator Online Free | Yoryantra",
    description:
      "Generate HMAC SHA signatures instantly with this free developer tool.",
  },
};

export default function Page() {
  return <ToolClient />;
}