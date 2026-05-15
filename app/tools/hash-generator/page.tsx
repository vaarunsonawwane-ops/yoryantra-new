import ToolClient from "./ToolClient";

export const metadata = {
  title: "Hash Generator Online Free | Yoryantra",

  description:
    "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly with this free online Hash Generator.",

  keywords: [
    "hash generator",
    "md5 generator",
    "sha256 generator",
    "sha512 generator",
    "sha1 generator",
    "online hash generator",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/hash-generator",
  },

  openGraph: {
    title: "Hash Generator Online Free | Yoryantra",

    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly online.",

    url: "https://yoryantra.com/tools/hash-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Hash Generator Online Free | Yoryantra",

    description:
      "Generate secure hashes instantly with this free online Hash Generator.",
  },
};

export default function Page() {
  return <ToolClient />;
}