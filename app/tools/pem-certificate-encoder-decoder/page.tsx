import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "PEM Certificate Encoder Decoder | RFC 7468 | Yoryantra",
  description:
    "Parse, normalize, extract and wrap PEM/Base64 certificates, keys, CSRs and CRLs while preserving separate blocks, labels, decoded sizes and line endings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/pem-certificate-encoder-decoder",
  },
  openGraph: {
    title: "PEM Certificate Encoder Decoder | Yoryantra",
    description:
      "Normalize or extract PEM blocks without collapsing certificate chains, and wrap strict Base64 with deliberate labels, line width and newline choices.",
    url: "https://yoryantra.com/tools/pem-certificate-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PEM Certificate Encoder Decoder | Yoryantra",
    description:
      "Parse and normalize PEM blocks, extract Base64, or wrap raw Base64 while preserving multi-block boundaries and labels.",
  },
};

export default function Page() {
  return <ToolClient />;
}
