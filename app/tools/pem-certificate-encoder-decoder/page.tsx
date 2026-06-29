import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "PEM Certificate Decoder & Encoder Online | Yoryantra",
  description:
    "Decode, encode, parse, and normalize PEM certificates, keys, CSRs, CRLs, and Base64 bodies. Inspect PEM blocks and fix line wrapping locally.",
  keywords: [
    "PEM certificate decoder",
    "PEM certificate encoder",
    "PEM decoder online",
    "PEM encoder online",
    "PEM parser",
    "certificate PEM decoder",
    "private key PEM parser",
    "public key PEM parser",
    "Base64 to PEM converter",
    "PEM to Base64 converter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/pem-certificate-encoder-decoder",
  },
  openGraph: {
    title: "PEM Certificate Decoder & Encoder Online | Yoryantra",
    description:
      "Decode, encode, parse, and normalize PEM certificates, keys, CSRs, CRLs, and Base64 bodies. Inspect PEM blocks and fix line wrapping locally.",
    url: "https://yoryantra.com/tools/pem-certificate-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PEM Certificate Decoder & Encoder Online | Yoryantra",
    description:
      "Decode, encode, parse, and normalize PEM certificates, keys, CSRs, CRLs, and Base64 bodies. Inspect PEM blocks and fix line wrapping locally.",
  },
};

export default function PemCertificateEncoderDecoderPage() {
  return <ToolClient />;
}
