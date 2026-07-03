import ToolClient from "./ToolClient";

export const metadata = {
  title: "RSA Signing Key Generator in SPKI and PKCS8 PEM | Yoryantra",
  description:
    "Generate extractable RSA signing key pairs with Web Crypto and export the public key as SPKI PEM and private key as unencrypted PKCS8 PEM.",
  keywords: [
    "rsa key generator",
    "rsa signing key generator",
    "rsa public private key generator",
    "pkcs8 private key generator",
    "spki public key generator",
    "pem key generator",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/rsa-key-generator",
  },
  openGraph: {
    title: "RSA Signing Key Generator in SPKI and PKCS8 PEM | Yoryantra",
    description:
      "Generate RSA signing key pairs locally with Web Crypto and export SPKI and unencrypted PKCS8 PEM files.",
    url: "https://yoryantra.com/tools/rsa-key-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RSA Signing Key Generator in SPKI and PKCS8 PEM | Yoryantra",
    description:
      "Generate RSA signing key pairs locally and export SPKI and PKCS8 PEM.",
  },
};

export default function Page() {
  return <ToolClient />;
}
