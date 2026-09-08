import ToolClient from "./ToolClient";

export const metadata = {
  title: "RSA Key Generator – SPKI & PKCS #8 PEM | Yoryantra",
  description:
    "Generate 2048, 3072 or 4096-bit RSA signing keys with Web Crypto and export SPKI public and unencrypted PKCS #8 private keys as PEM.",
  keywords: [
    "rsa key generator",
    "rsa signing key generator",
    "spki public key generator",
    "pkcs 8 private key generator",
    "rsa pem generator",
    "web crypto rsa",
    "rsassa pkcs1 v1 5",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/rsa-key-generator",
  },
  openGraph: {
    title: "RSA Key Generator – SPKI & PKCS #8 PEM | Yoryantra",
    description:
      "Generate RSA signing keys with Web Crypto and export SPKI public and unencrypted PKCS #8 private PEM blocks.",
    url: "https://yoryantra.com/tools/rsa-key-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RSA Key Generator – SPKI & PKCS #8 PEM | Yoryantra",
    description:
      "Generate RSA signing keys locally and export SPKI public and unencrypted PKCS #8 private PEM blocks.",
  },
};

export default function Page() {
  return <ToolClient />;
}
