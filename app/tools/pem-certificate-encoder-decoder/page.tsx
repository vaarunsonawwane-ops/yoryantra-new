import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "PEM Certificate Encoder Decoder | Parse and Normalize PEM Blocks | Yoryantra",
  description:
    "Parse, normalize, encode, and decode PEM certificate and key blocks. Extract Base64 bodies, detect PEM types, wrap lines, and inspect certificate/key text locally.",
  keywords: [
    "PEM Certificate Encoder Decoder",
    "PEM parser",
    "PEM decoder",
    "PEM encoder",
    "certificate PEM decoder",
    "private key PEM parser",
    "public key PEM parser",
    "Base64 PEM converter",
    "encoding tools",
    "certificate tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/pem-certificate-encoder-decoder",
  },
  openGraph: {
    title: "PEM Certificate Encoder Decoder | Parse and Normalize PEM Blocks | Yoryantra",
    description:
      "Parse, normalize, encode, and decode PEM certificate and key blocks. Extract Base64 bodies, detect PEM types, wrap lines, and inspect certificate/key text locally.",
    url: "https://yoryantra.com/tools/pem-certificate-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PEM Certificate Encoder Decoder | Parse and Normalize PEM Blocks | Yoryantra",
    description:
      "Parse, normalize, encode, and decode PEM certificate and key blocks. Extract Base64 bodies, detect PEM types, wrap lines, and inspect certificate/key text locally.",
  },
};

export default function PemCertificateEncoderDecoderPage() {
  return <ToolClient />;
}
