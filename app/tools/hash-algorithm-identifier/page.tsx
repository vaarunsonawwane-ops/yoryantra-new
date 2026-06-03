import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Hash Algorithm Identifier | Identify MD5 SHA1 SHA256 Hashes | Yoryantra",
  description:
    "Identify possible hash algorithms from a hash string. Check length, character set, common formats, MD5, SHA1, SHA256, SHA512, bcrypt, Argon2, UUID-like values, and more directly in your browser.",
  keywords: [
    "Hash Algorithm Identifier",
    "hash identifier",
    "identify hash type",
    "MD5 SHA1 SHA256 identifier",
    "hash type checker",
    "hash algorithm checker",
    "bcrypt hash identifier",
    "Argon2 hash identifier",
    "security tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/hash-algorithm-identifier",
  },
  openGraph: {
    title: "Hash Algorithm Identifier | Identify MD5 SHA1 SHA256 Hashes | Yoryantra",
    description:
      "Identify possible hash algorithms from a hash string. Check length, character set, common formats, MD5, SHA1, SHA256, SHA512, bcrypt, Argon2, UUID-like values, and more directly in your browser.",
    url: "https://yoryantra.com/tools/hash-algorithm-identifier",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hash Algorithm Identifier | Identify MD5 SHA1 SHA256 Hashes | Yoryantra",
    description:
      "Identify possible hash algorithms from a hash string. Check length, character set, common formats, MD5, SHA1, SHA256, SHA512, bcrypt, Argon2, UUID-like values, and more directly in your browser.",
  },
};

export default function HashAlgorithmIdentifierPage() {
  return <ToolClient />;
}
