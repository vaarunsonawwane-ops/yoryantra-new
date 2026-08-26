import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "PEM Certificate Encoder Decoder – PEM & Base64 | Yoryantra",
  description:
    "Parse PEM certificates, keys, CSRs and CRLs, extract or rebuild Base64, and normalize RFC 7468 wrapping locally. Formatting only; no trust validation.",
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
    title: "PEM Certificate Encoder Decoder – PEM & Base64 | Yoryantra",
    description:
      "Parse PEM certificates, keys, CSRs and CRLs, extract or rebuild Base64, and normalize RFC 7468 wrapping locally. Formatting only; no trust validation.",
    url: "https://yoryantra.com/tools/pem-certificate-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PEM Certificate Encoder Decoder – PEM & Base64 | Yoryantra",
    description:
      "Parse PEM certificates, keys, CSRs and CRLs, extract or rebuild Base64, and normalize RFC 7468 wrapping locally. Formatting only; no trust validation.",
  },
};

export default function PemCertificateEncoderDecoderPage() {
  return <ToolClient />;
}
