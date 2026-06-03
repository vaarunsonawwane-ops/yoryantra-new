import ToolClient from "./ToolClient";

export const metadata = {
  title: "PEM Formatter Online Free | Yoryantra",

  description:
    "Format PEM public keys, private keys, and certificates instantly with this free online PEM Formatter.",

  keywords: [
    "pem formatter",
    "pem key formatter",
    "private key formatter",
    "public key formatter",
    "pem certificate formatter",
    "rsa pem formatter",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/pem-formatter",
  },

  openGraph: {
    title:
      "PEM Formatter Online Free | Yoryantra",

    description:
      "Format PEM keys and certificates instantly online.",

    url:
      "https://yoryantra.com/tools/pem-formatter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "PEM Formatter Online Free | Yoryantra",

    description:
      "Format PEM public keys, private keys, and certificates instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}