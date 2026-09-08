import ToolClient from "./ToolClient";

export const metadata = {
  title: "SHA256 Generator – Exact UTF-8 SHA-256 Hash | Yoryantra",
  description:
    "Hash exact UTF-8 text with SHA-256, inspect byte and Unicode details, and understand why whitespace, line endings, and normalization change the digest.",
  keywords: [
    "sha256 generator",
    "sha256 hash generator",
    "generate sha256 hash",
    "utf8 sha256",
    "sha256 text hash",
    "sha256 checksum",
    "web crypto sha256",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/sha256-generator",
  },
  openGraph: {
    title: "SHA256 Generator – Exact UTF-8 SHA-256 Hash | Yoryantra",
    description:
      "Hash exact UTF-8 text and inspect the byte-level details that can make two SHA-256 results differ.",
    url: "https://yoryantra.com/tools/sha256-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHA256 Generator – Exact UTF-8 SHA-256 Hash | Yoryantra",
    description:
      "Generate a SHA-256 digest from exact UTF-8 text with byte, Unicode, and security context.",
  },
};

export default function Page() {
  return <ToolClient />;
}
