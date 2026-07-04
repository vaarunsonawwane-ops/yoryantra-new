import ToolClient from "./ToolClient";

export const metadata = {
  title: "Hash Generator | Yoryantra",
  description:
    "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text in your browser with clear hashing and security notes.",
  keywords: [
    "hash generator",
    "sha1 generator",
    "sha256 generator",
    "sha384 generator",
    "sha512 generator",
    "online hash generator",
    "developer utilities",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/hash-generator",
  },
  openGraph: {
    title: "Hash Generator | Yoryantra",
    description:
      "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text in your browser.",
    url: "https://yoryantra.com/tools/hash-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hash Generator | Yoryantra",
    description:
      "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
