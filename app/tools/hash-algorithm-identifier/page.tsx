import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Hash Algorithm Identifier – Format & Digest Clues | Yoryantra",
  description:
    "Separate self-identifying password hashes from ambiguous hex or Base64 digest shapes using prefixes, length, encoding, and format evidence.",
  keywords: [
    "hash algorithm identifier",
    "identify hash format",
    "bcrypt hash format",
    "Argon2 hash format",
    "SHA-256 digest length",
    "MD5 NTLM hash shape",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/hash-algorithm-identifier",
  },
  openGraph: {
    title: "Hash Algorithm Identifier – Format & Digest Clues | Yoryantra",
    description:
      "Distinguish structured password hashes from ambiguous digest shapes using prefixes, length, encoding, and visible format.",
    url: "https://yoryantra.com/tools/hash-algorithm-identifier",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hash Algorithm Identifier – Format & Digest Clues | Yoryantra",
    description:
      "Distinguish structured password hashes from ambiguous digest shapes using prefixes, length, encoding, and visible format.",
  },
};

export default function HashAlgorithmIdentifierPage() {
  return <ToolClient />;
}
