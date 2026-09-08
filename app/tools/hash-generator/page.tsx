import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Hash Generator for SHA-1 and SHA-2 Text Digests | Yoryantra",
  description:
    "Generate hexadecimal SHA-1, SHA-256, SHA-384, or SHA-512 digests from exact UTF-8 text and understand byte-level comparison limits.",
  keywords: [
    "hash generator",
    "SHA-256 hash",
    "SHA-512 hash",
    "SHA-384 hash",
    "SHA-1 hash",
    "UTF-8 digest",
    "hex digest",
  ],
  alternates: { canonical: "https://yoryantra.com/tools/hash-generator" },
  openGraph: {
    title: "Hash Generator for SHA-1 and SHA-2 Text Digests | Yoryantra",
    description:
      "Create hexadecimal SHA digests from exact UTF-8 text with byte, Unicode, and SHA-1 compatibility notes.",
    url: "https://yoryantra.com/tools/hash-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hash Generator for SHA-1 and SHA-2 Text Digests | Yoryantra",
    description:
      "Create hexadecimal SHA digests from exact UTF-8 text and see what can change the result.",
  },
};

export default function Page() {
  return <ToolClient />;
}
