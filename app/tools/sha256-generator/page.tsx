import ToolClient from "./ToolClient";

export const metadata = {
  title: "SHA256 Generator | Yoryantra",
  description:
    "Generate SHA-256 hashes from text in your browser and understand one-way hashing, exact input matching, and safe usage limits.",
  keywords: [
    "sha256 generator",
    "sha256 hash generator",
    "generate sha256 hash",
    "sha256 online",
    "cryptographic hash generator",
    "sha256 checksum",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/sha256-generator",
  },
  openGraph: {
    title: "SHA256 Generator | Yoryantra",
    description:
      "Generate SHA-256 hashes from text locally in your browser with clear hashing notes.",
    url: "https://yoryantra.com/tools/sha256-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHA256 Generator | Yoryantra",
    description:
      "Generate SHA-256 hashes from text locally in your browser with clear hashing notes.",
  },
};

export default function Page() {
  return <ToolClient />;
}
