import ToolClient from "./ToolClient";

export const metadata = {
  title: "SHA256 Generator Online Free | Yoryantra",

  description:
    "Generate SHA256 hashes from text instantly with this free online SHA256 Generator.",

  keywords: [
    "sha256 generator",
    "sha256 hash generator",
    "generate sha256 hash",
    "sha256 online",
    "cryptographic hash generator",
    "sha256 encoder",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/sha256-generator",
  },

  openGraph: {
    title:
      "SHA256 Generator Online Free | Yoryantra",

    description:
      "Generate SHA256 hashes instantly online.",

    url:
      "https://yoryantra.com/tools/sha256-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "SHA256 Generator Online Free | Yoryantra",

    description:
      "Generate SHA256 hashes instantly from text.",
  },
};

export default function Page() {
  return <ToolClient />;
}