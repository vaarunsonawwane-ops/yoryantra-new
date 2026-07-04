import ToolClient from "./ToolClient";

export const metadata = {
  title: "PEM Formatter | Yoryantra",
  description:
    "Format PEM certificates, public keys, private keys, CSRs, and multiple PEM blocks with 64-character Base64 line wrapping.",
  keywords: [
    "pem formatter",
    "pem key formatter",
    "private key formatter",
    "public key formatter",
    "pem certificate formatter",
    "rsa pem formatter",
    "pem line wrap tool",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/pem-formatter",
  },
  openGraph: {
    title: "PEM Formatter | Yoryantra",
    description:
      "Format PEM certificates, keys, CSRs, and multiple PEM blocks with safer label checks and clean line wrapping.",
    url: "https://yoryantra.com/tools/pem-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PEM Formatter | Yoryantra",
    description:
      "Format PEM certificates, keys, CSRs, and PEM blocks in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
